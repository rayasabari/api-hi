import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import env from '../config/env';
import { formatDuration } from '../utils/time-utils';

const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.emailUser,
    pass: env.emailPassword,
  },
});

const loadEmailTemplate = async (templateName: string, variables: Record<string, string>): Promise<string> => {
  // In production (bundled by tsup), __dirname is 'dist/' and views are at 'dist/views/'
  // In development (tsx watch), __dirname is 'src/services/' and views are at 'src/views/'
  // Use process.cwd() as base and determine views path based on whether we're in dist or src
  const viewsPath = path.join(process.cwd(), 'dist', 'views', 'emails', `${templateName}.html`);
  const devViewsPath = path.join(process.cwd(), 'src', 'views', 'emails', `${templateName}.html`);

  // Try production path first, fall back to development path
  let templatePath: string;
  try {
    await fs.access(viewsPath);
    templatePath = viewsPath;
  } catch {
    templatePath = devViewsPath;
  }

  let template = await fs.readFile(templatePath, 'utf-8');

  // Replace all variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return template;
};

const sendResetPasswordEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${resetToken}`;

  const html = await loadEmailTemplate('reset-password', { resetUrl });

  const mailOptions = {
    from: env.emailFrom,
    to: email,
    subject: 'Reset Password Request',
    html,
  };

  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const verificationUrl = `${env.frontendUrl}/verify-email?token=${verificationToken}`;
  const expiryTime = formatDuration(env.emailVerificationTokenExpiry);

  const html = await loadEmailTemplate('verify-email', {
    verificationUrl,
    expiryTime,
  });

  const mailOptions = {
    from: env.emailFrom,
    to: email,
    subject: 'Verify Your Email Address',
    html,
  };

  await transporter.sendMail(mailOptions);
};

const emailService = {
  sendResetPasswordEmail,
  sendVerificationEmail,
};

export default emailService;
