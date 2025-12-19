import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';

/**
 * Generate a random token using crypto.randomBytes
 * @returns 32-byte hex string
 */
const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateResetToken = (): string => generateRandomToken();

export const generateVerificationToken = (): string => generateRandomToken();

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a JWT token
 * @param payload - The data to encode in the token
 * @param secret - The secret key for signing
 * @param expiresIn - Token expiration time (e.g., '1h', '7d')
 * @returns Signed JWT token
 */
export const generateJwtToken = (
  payload: object,
  secret: Secret,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};