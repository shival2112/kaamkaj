export function verifyEmailHtml(name: string, token: string): string {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7ff;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <tr><td style="background:#5B5BD6;padding:28px 32px">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700">KaamKaaj</h1>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 12px;color:#111827;font-size:20px">Verify your email, ${name}</h2>
          <p style="margin:0 0 20px;color:#6B7280;font-size:15px;line-height:1.6">
            Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;background:#10B981;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600">Verify Email Address</a>
          <p style="margin:20px 0 0;color:#6B7280;font-size:13px">Or copy this link into your browser:</p>
          <p style="margin:4px 0 0;word-break:break-all;color:#5B5BD6;font-size:12px">${verifyUrl}</p>
          <p style="margin:24px 0 0;color:#9CA3AF;font-size:12px">If you didn't sign up for KaamKaaj, ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
