export function companyApprovedHtml(companyName: string): string {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/employer/dashboard`;
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
          <h2 style="margin:0 0 12px;color:#111827;font-size:20px">Company Approved! 🎉</h2>
          <p style="margin:0 0 20px;color:#6B7280;font-size:15px;line-height:1.6">
            Great news! <strong style="color:#111827">${companyName}</strong> has been approved on KaamKaaj.
            You can now post jobs and start receiving applications from candidates.
          </p>
          <a href="${dashboardUrl}" style="display:inline-block;background:#10B981;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600">Go to Dashboard</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
