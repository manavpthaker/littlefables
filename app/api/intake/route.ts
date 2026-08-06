import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { sendIntakeNotification } from '@/lib/server/resend-mailer';

// Buyer intake submission handler. Called by the client form in
// app/intake/intake-form.tsx as multipart/form-data.
//
// Two entry paths:
//   /intake/[token]  → the form arrives with `token`. We update the
//                      pre-created 'awaiting' row and flip it to 'new'.
//                      Buyer email + Etsy order are already known.
//   /intake          → walk-up submission, buyer types their own email.
//                      We insert a fresh row with status 'new'. This is
//                      the safety-net path; the pre-order flow is the
//                      one we send to Etsy buyers.

export const runtime = 'nodejs';

const NOTIFY_EMAIL = process.env.INTAKE_NOTIFY_EMAIL || process.env.RESEND_FROM_EMAIL;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://littlefables.app';

function str(v: FormDataEntryValue | null): string {
  if (typeof v !== 'string') return '';
  return v.trim();
}

function list(form: FormData, key: string): string[] {
  return form
    .getAll(key)
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'expected multipart form data' }, { status: 400 });
  }

  const token = str(form.get('token')) || null;
  const childName = str(form.get('child_name'));
  const parentLastname = str(form.get('parent_lastname')) || null;
  const ageBand = str(form.get('age_band')) || null;
  const ageYearsRaw = str(form.get('age_years'));
  const ageYears = ageYearsRaw ? Number(ageYearsRaw) : null;
  const interests = list(form, 'interests').slice(0, 3);
  const traits = list(form, 'traits').slice(0, 2);
  const interestsNote = str(form.get('interests_note')) || null;
  const traitsNote = str(form.get('traits_note')) || null;
  const inspirations = str(form.get('inspirations')) || null;
  const look = str(form.get('look')) || null;
  const companions = str(form.get('companions')) || null;
  const giftFrom = str(form.get('gift_from')) || null;

  if (!childName) {
    return NextResponse.json({ error: 'a name to write the book for is required' }, { status: 400 });
  }

  const supa = admin();

  // Load the pre-created row (token path) or prepare a fresh insert.
  let existing: {
    id: string;
    buyer_email: string;
    etsy_order: string | null;
    photo_path: string | null;
    status: string;
  } | null = null;

  if (token) {
    const { data, error } = await supa
      .from('intakes')
      .select('id, buyer_email, etsy_order, photo_path, status')
      .eq('token', token)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'this intake link is no longer valid' }, { status: 404 });
    }
    if (data.status !== 'awaiting') {
      return NextResponse.json({ error: 'this intake has already been submitted' }, { status: 409 });
    }
    existing = data;
  }

  // Walk-up path: buyer supplied their own email.
  const buyerEmail = existing?.buyer_email ?? str(form.get('buyer_email')).toLowerCase();
  const etsyOrder = existing?.etsy_order ?? (str(form.get('etsy_order')) || null);
  if (!isEmail(buyerEmail)) {
    return NextResponse.json({ error: 'a working email address is required so we can send previews' }, { status: 400 });
  }

  // Photo upload (both paths).
  let photoPath: string | null = existing?.photo_path ?? null;
  const photo = form.get('photo');
  if (photo && typeof photo !== 'string' && photo.size > 0) {
    if (photo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'photo must be under 10 MB' }, { status: 400 });
    }
    const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const key = `${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const up = await supa.storage.from('intake-uploads').upload(key, bytes, {
      contentType: photo.type || 'application/octet-stream',
      upsert: false,
    });
    if (up.error) {
      return NextResponse.json({ error: `photo upload failed: ${up.error.message}` }, { status: 500 });
    }
    photoPath = key;
  }

  let intakeId: string;
  if (existing) {
    const upd = await supa
      .from('intakes')
      .update({
        status: 'new',
        child_name: childName,
        age_band: ageBand,
        age_years: Number.isFinite(ageYears) ? ageYears : null,
        interests,
        traits,
        interests_note: interestsNote,
        traits_note: traitsNote,
        inspirations,
        look,
        companions,
        parent_lastname: parentLastname,
        gift_from: giftFrom,
        photo_path: photoPath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('id')
      .single();
    if (upd.error || !upd.data) {
      return NextResponse.json({ error: upd.error?.message || 'could not save intake' }, { status: 500 });
    }
    intakeId = upd.data.id;
  } else {
    const ins = await supa
      .from('intakes')
      .insert({
        status: 'new',
        buyer_email: buyerEmail,
        child_name: childName,
        age_band: ageBand,
        age_years: Number.isFinite(ageYears) ? ageYears : null,
        interests,
        traits,
        interests_note: interestsNote,
        traits_note: traitsNote,
        inspirations,
        look,
        companions,
        parent_lastname: parentLastname,
        gift_from: giftFrom,
        etsy_order: etsyOrder,
        photo_path: photoPath,
      })
      .select('id')
      .single();
    if (ins.error || !ins.data) {
      return NextResponse.json({ error: ins.error?.message || 'could not save intake' }, { status: 500 });
    }
    intakeId = ins.data.id;
  }

  if (NOTIFY_EMAIL) {
    try {
      let photoUrl: string | null = null;
      if (photoPath) {
        const signed = await supa.storage
          .from('intake-uploads')
          .createSignedUrl(photoPath, 60 * 60 * 24 * 7);
        photoUrl = signed.data?.signedUrl ?? null;
      }
      await sendIntakeNotification({
        to: NOTIFY_EMAIL,
        intakeId,
        buyerEmail,
        childName,
        ageBand,
        interests,
        traits,
        inspirations,
        look,
        companions,
        parentLastname,
        giftFrom,
        etsyOrder,
        photoUrl,
        adminUrl: `${BASE_URL}/parent/intakes`,
      });
    } catch (err) {
      console.error('intake notification failed', err);
    }
  } else {
    console.warn('INTAKE_NOTIFY_EMAIL / RESEND_FROM_EMAIL not set — no notification sent');
  }

  return NextResponse.json({ ok: true, id: intakeId });
}
