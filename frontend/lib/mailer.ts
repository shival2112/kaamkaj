import nodemailer from 'nodemailer';

function createTransporter() {
  switch (process.env.EMAIL_MODE) {
    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
      });

    case 'mailtrap':
      return nodemailer.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: { user: process.env.MAILTRAP_USER, pass: process.env.MAILTRAP_PASS },
      });

    default: // ethereal
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: process.env.ETHEREAL_USER, pass: process.env.ETHEREAL_PASS },
      });
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = createTransporter();
  const from =
    process.env.EMAIL_MODE === 'gmail'
      ? `"KaamKaaj" <${process.env.GMAIL_USER}>`
      : '"KaamKaaj" <no-reply@kaamkaaj.com>';

  const info = await transporter.sendMail({ from, to, subject, html });

  if (process.env.EMAIL_MODE === 'ethereal') {
    console.log('📧 Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
  } else if (process.env.EMAIL_MODE === 'mailtrap') {
    console.log('📧 Mailtrap inbox: https://mailtrap.io/inboxes');
  }

  return info;
}
