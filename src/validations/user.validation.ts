import { z } from 'zod';
import { requiredString } from '../utils/zod-helper.ts';

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
    password: z.string().min(6).max(100),
  }),
});

export const updateUserSchema = z.object({
  body: baseUserBody.partial(),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: requiredString('Current password is required'),

    newPassword: requiredString('New password is required')
      .pipe(
        z.string()
          .min(6, 'New password must be at least 6 characters long')
          .max(100, 'New password must be at most 100 characters long')
      ),

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

    password: requiredString('Password is required')
      .pipe(
        z.string()
          .min(8, 'Password must be at least 8 characters')
          .max(100, 'Password must be at most 100 characters')
          .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
          .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
          .regex(/[0-9]/, 'Password must contain at least one number')
      ),
  }),
});