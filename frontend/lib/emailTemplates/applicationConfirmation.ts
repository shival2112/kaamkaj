export function applicationConfirmationHtml(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  appliedAt: Date,
): string {
  const date = appliedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
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
          <h2 style="margin:0 0 12px;color:#111827;font-size:20px">Application Submitted ✅</h2>
          <p style="margin:0 0 20px;color:#6B7280;font-size:15px;line-height:1.6">
            Hi ${candidateName}, your application has been successfully submitted.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FF;border-radius:8px;padding:20px;margin-bottom:20px">
            <tr><td style="padding:6px 0">
              <span style="color:#6B7280;font-size:13px">Position</span><br>
              <span style="color:#111827;font-size:15px;font-weight:600">${jobTitle}</span>
            </td></tr>
            <tr><td style="padding:6px 0">
              <span style="color:#6B7280;font-size:13px">Company</span><br>
              <span style="color:#111827;font-size:15px;font-weight:600">${companyName}</span>
            </td></tr>
            <tr><td style="padding:6px 0">
              <span style="color:#6B7280;font-size:13px">Applied on</span><br>
              <span style="color:#111827;font-size:15px;font-weight:600">${date}</span>
            </td></tr>
          </table>
          <p style="margin:0;color:#6B7280;font-size:13px">We'll notify you when the employer reviews your application.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
