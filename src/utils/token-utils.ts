import crypto from 'crypto';

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