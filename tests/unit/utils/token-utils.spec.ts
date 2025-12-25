import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  generateResetToken,
  generateVerificationToken,
  hashToken,
  generateJwtToken
} from '../../../src/utils/token-utils';

describe('Token Utils', () => {
  describe('generateResetToken', () => {
    it('should generate a 64-character hex string (32 bytes)', () => {
      const token = generateResetToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // 32 bytes in hex is 64 characters
      expect(token).toHaveLength(64);
    });

    it('should generate unique tokens', () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateVerificationToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateVerificationToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token).toHaveLength(64);
    });
  });

  describe('hashToken', () => {
    it('should hash a token using SHA256', () => {
      const token = 'testtoken';
      const hash = hashToken(token);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      // SHA256 hex digest is 64 characters
      expect(hash).toHaveLength(64);

      // Known hash for 'testtoken' using sha256
      // echo -n "testtoken" | shasum -a 256
      // f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae
      expect(hash).toBe('ada63e98fe50eccb55036d88eda4b2c3709f53c2b65bc0335797067e9a2a5d8b');
    });
  });

  describe('generateJwtToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 123 };
      const secret = 'testsecret';
      const expiresIn = '1h';

      const token = generateJwtToken(payload, secret, expiresIn);

      expect(token).toBeDefined();

      // Verify the token
      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.userId).toBe(123);
    });
  });
});
