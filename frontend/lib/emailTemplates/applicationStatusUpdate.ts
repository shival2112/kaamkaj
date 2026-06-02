export function applicationStatusUpdateHtml(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  status: string,
): string {
  const isShortlisted = status === 'SHORTLISTED';
  const statusLabel = status.charAt(0) + status.slice(1).toLowerCase();
  const statusColor = isShortlisted ? '#10B981' : '#EF4444';
  const message = isShortlisted
    ? 'Great news! The employer has shortlisted your application. They may reach out soon for next steps.'
    : 'The employer has reviewed your application and decided not to move forward at this time. Don\'t be discouraged — keep applying!';

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
          <h2 style="margin:0 0 12px;color:#111827;font-size:20px">Application Update</h2>
          <p style="margin:0 0 20px;color:#6B7280;font-size:15px">Hi ${candidateName},</p>
          <p style="margin:0 0 20px;color:#6B7280;font-size:15px;line-height:1.6">
            Your application for <strong style="color:#111827">${jobTitle}</strong> at <strong style="color:#111827">${companyName}</strong> has been updated.
          </p>
          <div style="display:inline-block;background:${statusColor}1A;color:${statusColor};padding:8px 20px;border-radius:99px;font-size:14px;font-weight:700;margin-bottom:20px">${statusLabel}</div>
          <p style="margin:0;color:#6B7280;font-size:14px;line-height:1.6">${message}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
