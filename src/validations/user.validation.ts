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