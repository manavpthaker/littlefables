// Thin wrapper around Resend's REST API. Kept dep-free (no @resend/node)
// because we send at most one email per user action and the REST body is
// three fields. Fewer deps to keep the Vercel bundle small.
//
// Env:
//   RESEND_API_KEY         required
//   RESEND_FROM_EMAIL      required (must be on a Resend-verified domain)
//   RESEND_FROM_NAME       optional; defaults to "Little Fables"

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface ResendSuccess {
  id: string;
}

interface ResendError {
  statusCode: number;
  name: string;
  message: string;
}

function apiKey(): string {
  const v = process.env.RESEND_API_KEY;
  if (!v) throw new Error('RESEND_API_KEY is required — see .env.example');
  return v;
}

function fromAddress(): string {
  const email = process.env.RESEND_FROM_EMAIL;
  if (!email) throw new Error('RESEND_FROM_EMAIL is required — see .env.example');
  const name = process.env.RESEND_FROM_NAME?.trim() || 'Little Fables';
  return `${name} <${email}>`;
}

/** Send one email via Resend. Resolves with the Resend message id on
 *  success, throws with the API error message otherwise. */
export async function sendEmail(args: SendArgs): Promise<string> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });

  const body = (await res.json().catch(() => null)) as ResendSuccess | ResendError | null;

  if (!res.ok || !body || 'statusCode' in body) {
    const err = body && 'message' in body ? body.message : `resend returned ${res.status}`;
    throw new Error(`resend send failed: ${err}`);
  }

  return body.id;
}

/** Branded OTP email. Layout matches design-handoff at
 *  /Users/manavthaker/Downloads/OTP email HTML code/otp-email.html:
 *  header wordmark, double-rule ornament, code box, magic-link button.
 *
 *  Palette hex-baked (not tokens) because email clients don't support
 *  CSS variables. Inline styles because <style> and <link> get stripped
 *  by Gmail/Outlook. */
export async function sendOtpEmail(params: {
  to: string;
  code: string;
  signInUrl: string;
}): Promise<string> {
  const { to, code, signInUrl } = params;

  const subject = 'Your Little Fables Code';

  const text = [
    'Your Little Fables sign-in code',
    '',
    `  ${code}`,
    '',
    'Enter this code to sign in. It works once and expires shortly.',
    '',
    'Or follow this link and we will sign you in directly:',
    signInUrl,
    '',
    'If you did not ask for this code, you can ignore this note — nothing changes without it.',
    '',
    'Little Fables · made for one child at a time',
    `This code was requested for ${to}.`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Your sign-in code</title>
</head>
<body style="margin:0;padding:0;background:#EDE3CE;">
<span style="display:none;font-size:1px;line-height:1px;color:#EDE3CE;max-height:0;max-width:0;opacity:0;overflow:hidden;">Your one-time sign-in code for Little Fables. It works once and expires shortly.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EDE3CE;padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#EDE3CE;">
        <tr>
          <td style="padding:18px 32px 8px;font-family:'IM Fell English',Georgia,serif;font-size:19px;color:#2A1D12;">Little Fables</td>
        </tr>
        <tr>
          <td style="padding:0 32px;">
            <div style="border-top:1px solid #8A7156;height:3px;font-size:0;line-height:0;">&nbsp;</div>
            <div style="border-top:2px solid #8A7156;font-size:0;line-height:0;">&nbsp;</div>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 32px 6px;font-family:'IM Fell English',Georgia,serif;font-size:26px;line-height:32px;mso-line-height-rule:exactly;color:#2A1D12;">Your sign-in code</td>
        </tr>
        <tr>
          <td style="padding:8px 32px;font-family:'EB Garamond',Georgia,Cambria,serif;font-size:17px;line-height:26px;mso-line-height-rule:exactly;color:#57432E;">Enter this code to sign in. It works once and expires shortly.</td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background:#F3EBD8;border:1px solid #B89154;border-radius:12px;padding:16px 28px;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:36px;mso-line-height-rule:exactly;letter-spacing:8px;color:#2A1D12;">${code}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 32px 4px;font-family:'EB Garamond',Georgia,Cambria,serif;font-size:17px;line-height:26px;mso-line-height-rule:exactly;color:#57432E;">Or follow the link and we will sign you in directly.</td>
        </tr>
        <tr>
          <td style="padding:10px 32px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="#7D2E2B" style="background:#7D2E2B;border-radius:10px;">
                  <a href="${signInUrl}" style="display:inline-block;padding:13px 26px;font-family:'EB Garamond',Georgia,Cambria,serif;font-size:17px;color:#F3EBD8;text-decoration:none;">Sign in</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 0;font-family:'EB Garamond',Georgia,Cambria,serif;font-size:14px;line-height:21px;mso-line-height-rule:exactly;color:#8A7156;">If you did not ask for this code, you can ignore this note — nothing changes without it.</td>
        </tr>
        <tr>
          <td style="padding:26px 32px 30px;font-family:'EB Garamond',Georgia,Cambria,serif;font-size:13px;line-height:19px;mso-line-height-rule:exactly;color:#8A7156;">
            Little Fables · made for one child at a time<br>
            This code was requested for ${to}.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return sendEmail({ to, subject, html, text });
}

/** Plain-text-first shop notification when a new /intake row lands.
 *  This email is for Manav, not the buyer — no design polish, just the
 *  fields he needs to open the admin page and start building. */
export async function sendIntakeNotification(params: {
  to: string;
  intakeId: string;
  buyerEmail: string;
  childName: string;
  ageBand: string | null;
  interests: string[];
  traits: string[];
  inspirations: string | null;
  look: string | null;
  companions: string | null;
  parentLastname: string | null;
  giftFrom: string | null;
  etsyOrder: string | null;
  photoUrl: string | null;
  adminUrl: string;
}): Promise<string> {
  const {
    to, intakeId, buyerEmail, childName, ageBand, interests, traits,
    inspirations, look, companions, parentLastname, giftFrom, etsyOrder, photoUrl, adminUrl,
  } = params;

  const subject = giftFrom
    ? `New gift intake — ${childName} (from ${giftFrom})`
    : `New intake — ${childName}`;

  const rows: [string, string | null][] = [
    ['Buyer', buyerEmail],
    ['Family', parentLastname],
    ['Etsy order', etsyOrder],
    ['Gift from', giftFrom],
    ['Child', childName],
    ['Age band', ageBand],
    ['Interests', interests.length ? interests.join(', ') : null],
    ['Traits', traits.length ? traits.join(', ') : null],
    ['Inspirations', inspirations],
    ['Look', look],
    ['Cast', companions ?? `Just ${childName}`],
    ['Photo', photoUrl],
    ['Admin', adminUrl],
    ['Intake id', intakeId],
  ];

  const text = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const htmlRows = rows
    .filter(([, v]) => v)
    .map(([k, v]) => {
      const value = k === 'Photo' || k === 'Admin'
        ? `<a href="${v}">${v}</a>`
        : escapeHtml(String(v));
      return `<tr><td style="padding:4px 12px 4px 0;color:#8A7156;font-family:Georgia,serif;font-size:14px;vertical-align:top;">${k}</td><td style="padding:4px 0;font-family:Georgia,serif;font-size:15px;color:#2A1D12;">${value}</td></tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#EDE3CE;font-family:Georgia,serif;">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#F3EBD8;border:1px solid #B89154;border-radius:12px;padding:24px;">
<tr><td style="font-size:20px;color:#2A1D12;padding-bottom:12px;">${escapeHtml(subject)}</td></tr>
<tr><td><table role="presentation" cellpadding="0" cellspacing="0">${htmlRows}</table></td></tr>
</table></body></html>`;

  return sendEmail({ to, subject, html, text });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
