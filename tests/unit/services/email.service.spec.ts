import { describe, it, expect, vi, beforeEach } from 'vitest';
import emailService from '../../../src/services/email.service';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';

// Mock dependencies
const { sendMailMock } = vi.hoisted(() => {
  return { sendMailMock: vi.fn() };
});

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: sendMailMock,
    }),
  },
}));
vi.mock('fs/promises');
vi.mock('../../../src/config/env', () => ({
  default: {
    emailHost: 'smtp.test.com',
    emailPort: 587,
    emailUser: 'test@test.com',
    emailPassword: 'password',
    emailFrom: 'noreply@test.com',
    frontendUrl: 'http://localhost:3000',
    emailVerificationTokenExpiry: 3600000, // 1 hour
  },
}));

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock for fs.readFile
    vi.mocked(fs.readFile).mockResolvedValue('<html><body>{{resetUrl}}</body></html>');
  });

  describe('sendResetPasswordEmail', () => {
    it('should send reset password email with correct template processing', async () => {
      const email = 'user@example.com';
      const token = 'reset-token-123';

      await emailService.sendResetPasswordEmail(email, token);

      expect(fs.readFile).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
        to: email,
        subject: 'Reset Password Request',
        html: expect.stringContaining('http://localhost:3000/reset-password?token=reset-token-123'),
      }));
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with correct template processing', async () => {
      const email = 'user@example.com';
      const token = 'verify-token-123';

      // Mock template for verification
      vi.mocked(fs.readFile).mockResolvedValue('<html><body>{{verificationUrl}} - {{expiryTime}}</body></html>');

      await emailService.sendVerificationEmail(email, token);

      expect(fs.readFile).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
        to: email,
        subject: 'Verify Your Email Address',
        html: expect.stringContaining('http://localhost:3000/verify-email?token=verify-token-123'),
      }));
    });
  });
});
