export function welcomeEmailHtml(name: string): string {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7ff;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr><td style="background:#5B5BD6;padding:28px 32px">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700">KaamKaaj</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px">India's job portal</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 16px;color:#111827;font-size:20px">Welcome, ${name}! 🎉</h2>
          <p style="margin:0 0 20px;color:#6B7280;font-size:15px;line-height:1.6">
            Your KaamKaaj account is ready. Start exploring thousands of jobs across India.
          </p>
          <a href="${loginUrl}" style="display:inline-block;background:#5B5BD6;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600">Sign in to KaamKaaj</a>
          <p style="margin:24px 0 0;color:#9CA3AF;font-size:12px">If you didn't create this account, ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
