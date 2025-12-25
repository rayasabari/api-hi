import { describe, it, expect } from 'vitest';
import { requiredString } from '../../../src/utils/zod-helper';
import { z } from 'zod';

describe('Zod Helper', () => {
  describe('requiredString', () => {
    it('should validate a valid non-empty string', () => {
      const schema = requiredString();
      const result = schema.safeParse('valid');
      expect(result.success).toBe(true);
    });

    it('should trip whitespace', () => {
      const schema = requiredString();
      const result = schema.safeParse('  trimmed  ');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('trimmed');
      }
    });

    it('should fail for empty string', () => {
      const schema = requiredString();
      const result = schema.safeParse('   '); // Trims to empty
      expect(result.success).toBe(false);
    });

    it('should use custom error message', () => {
      const schema = requiredString('Custom error');
      const result = schema.safeParse('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Custom error');
      }
    });
  });
});
