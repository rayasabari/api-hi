import nodemailer from 'nodemailer';
import env from '../config/env.ts';

const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.emailUser,
    pass: env.emailPassword,
  },
});

const sendResetPasswordEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: env.emailFrom,
    to: email,
    subject: 'Reset Password Request',
    html: `
      <h1>Reset Password</h1>
      <p>Anda menerima email ini karena Anda (atau seseorang) telah meminta reset password.</p>
      <p>Silakan klik link berikut untuk reset password Anda:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Link ini akan kadaluarsa dalam 1 jam.</p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const emailService = {
  sendResetPasswordEmail,
};

export default emailService;
