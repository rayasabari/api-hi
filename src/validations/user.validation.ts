import { z } from 'zod';
import { requiredString } from '../utils/zod-helper';
import { passwordSchema } from './password';

const baseUserBody = z.object({
  username: requiredString("Username required")
    .pipe(
      z.string()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username must be at most 30 characters long")
    )
    .transform((v: string) => v.toLowerCase()),

  displayName: requiredString("Display Name required")
    .pipe(
      z.string()
        .min(3, "Display Name must be at least 3 character long")
        .max(100, "Display Name must be at most 100 characters long")
    ),

  email: requiredString("Email required")
    .pipe(z.email("Invalid email address"))
    .transform((v: string) => v.toLowerCase()),
});

export const createUserSchema = z.object({
  body: baseUserBody,
});

export const registerUserSchema = z.object({
  body: baseUserBody.extend({
    password: passwordSchema(),
  }),
});

export const updateUserSchema = z.object({
  body: baseUserBody.partial(),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: requiredString('Current password is required'),
    newPassword: passwordSchema('New password'),
    confirmPassword: requiredString('Confirm password is required')
      .pipe(z.string().min(1, 'Confirm password cannot be empty')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: requiredString('Email is required')
      .pipe(z.email('Invalid email format')),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: requiredString('Token is required')
      .pipe(z.string().min(1, 'Token is required')),
    password: passwordSchema(),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: requiredString('Token is required')
      .pipe(z.string().min(1, 'Token is required')),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: requiredString('Email is required')
      .pipe(z.email('Invalid email format')),
  }),
});