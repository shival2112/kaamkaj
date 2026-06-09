export function meetingScheduledHtml(
  recipientName: string,
  jobTitle: string,
  orgName: string,
  date: string,
  time: string,
  mode: string,
  round?: string,
  interviewer?: string,
  link?: string,
  isEmployer = false,
): string {
  const greeting = isEmployer
    ? `A meeting has been scheduled with you regarding <strong>${jobTitle}</strong>.`
    : `You have been scheduled for an interview for the <strong>${jobTitle}</strong> role at <strong>${orgName}</strong>.`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Inter,sans-serif;background:#f9fafb;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#5B5BD6,#7c3aed);padding:32px;text-align:center;">
      <h1 style="color:#fff;font-size:22px;margin:0;">Meeting Scheduled 📅</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#111827;font-size:15px;margin:0 0 16px;">Hi <strong>${recipientName}</strong>,</p>
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">${greeting}</p>
      <div style="background:#f5f7ff;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:14px;color:#111827;"><strong>📅 Date:</strong> ${date}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#111827;"><strong>🕐 Time:</strong> ${time}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#111827;"><strong>📍 Mode:</strong> ${mode}</p>
        ${round    ? `<p style="margin:0 0 8px;font-size:14px;color:#111827;"><strong>🔄 Round:</strong> ${round}</p>` : ''}
        ${interviewer ? `<p style="margin:0 0 8px;font-size:14px;color:#111827;"><strong>👤 With:</strong> ${interviewer}</p>` : ''}
        ${link     ? `<p style="margin:8px 0 0;font-size:14px;color:#5B5BD6;"><strong>🔗 Link:</strong> <a href="${link}" style="color:#5B5BD6;">${link}</a></p>` : ''}
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0;">
        Please be prepared and on time. If you have any questions, contact the KaamKaaj team.
      </p>
    </div>
    <div style="border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">KaamKaaj — Find your dream job</p>
    </div>
  </div>
</body>
</html>`;
}
