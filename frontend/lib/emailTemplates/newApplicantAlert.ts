export function newApplicantAlertHtml(
  applicantName: string,
  jobTitle: string,
  applicantsUrl: string,
): string {
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
          <h2 style="margin:0 0 12px;color:#111827;font-size:20px">New Applicant 🎯</h2>
          <p style="margin:0 0 20px;color:#6B7280;font-size:15px;line-height:1.6">
            <strong style="color:#111827">${applicantName}</strong> has applied for your job posting:
            <strong style="color:#5B5BD6">${jobTitle}</strong>.
          </p>
          <a href="${applicantsUrl}" style="display:inline-block;background:#5B5BD6;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600">View Applicants</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
