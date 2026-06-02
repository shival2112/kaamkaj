import nodemailer from 'nodemailer';

function createTransporter() {
  if (process.env.EMAIL_MODE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  });
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

  if (process.env.EMAIL_MODE !== 'gmail') {
    console.log('📧 Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
}
