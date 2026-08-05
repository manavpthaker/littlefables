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

/** Branded 6-digit OTP email. Kept close to the sending helper so the
 *  copy and the render stay in one file — one screen for a designer to
 *  audit. See docs/commerce/positioning.md for voice. */
export async function sendOtpEmail(params: { to: string; code: string }): Promise<string> {
  const { to, code } = params;
  const grouped = `${code.slice(0, 3)} ${code.slice(3)}`; // 123 456 — easier to type
  const subject = `Your Little Fables sign-in code: ${grouped}`;

  const text = [
    `Your Little Fables sign-in code is ${grouped}.`,
    '',
    'Enter it on the sign-in page to open your parent settings.',
    'The code expires in about an hour.',
    '',
    'If you did not ask for this, you can ignore this email.',
    '— Little Fables',
  ].join('\n');

  // Inline styles because email clients strip <style> and <link>.
  // Palette hex-baked (not tokens) because CSS variables aren't available
  // in email contexts.
  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#EDE3CE;font-family:Georgia,'EB Garamond',serif;color:#2A1D12">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDE3CE;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#F3EBD8;border:1px solid rgba(42,29,18,0.10);border-radius:12px;padding:36px 32px;max-width:480px">
          <tr>
            <td align="center" style="font-family:Georgia,'IM Fell English SC',serif;font-size:12px;letter-spacing:0.14em;color:#A67C3A;text-transform:lowercase;padding-bottom:8px">
              little fables
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Georgia,'IM Fell English',serif;font-size:22px;line-height:1.3;color:#2A1D12;padding-bottom:24px">
              Sign in to your parent settings
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Consolas,'Courier New',monospace;font-size:34px;letter-spacing:0.18em;color:#2A1D12;background:#EDE3CE;border:1px solid rgba(138,113,86,0.4);border-radius:8px;padding:18px 28px">
              ${grouped}
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Georgia,'EB Garamond',serif;font-size:15px;line-height:1.6;color:#57432E;padding-top:24px">
              Enter it on the sign-in page to open your parent settings.<br>
              The code expires in about an hour.
            </td>
          </tr>
          <tr>
            <td align="center" style="font-family:Georgia,'EB Garamond',serif;font-size:12px;line-height:1.5;color:#8A7156;padding-top:28px;border-top:1px solid rgba(42,29,18,0.10);margin-top:20px">
              If you didn&rsquo;t ask for this, you can ignore this email.
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
