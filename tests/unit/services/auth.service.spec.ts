import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from '../../../src/services/auth.service';
import userRepository from '../../../src/repositories/user.repository';
import emailService from '../../../src/services/email.service';
import logger from '../../../src/config/logger';

// Mock dependencies
vi.mock('../../../src/repositories/user.repository');
vi.mock('../../../src/services/email.service');
vi.mock('../../../src/config/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../../../src/utils/password-utils', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
  comparePassword: vi.fn().mockResolvedValue(true),
}));
vi.mock('../../../src/utils/token-utils', () => ({
  generateVerificationToken: vi.fn().mockReturnValue('verification_token'),
  generateResetToken: vi.fn().mockReturnValue('reset_token'),
  hashToken: vi.fn().mockReturnValue('hashed_token'),
  generateJwtToken: vi.fn().mockReturnValue('jwt_token'),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const payload = {
        username: 'newuser',
        displayName: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const createdUser = {
        id: 1,
        ...payload,
        password: 'hashed_password',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(userRepository.create).mockResolvedValue(createdUser as any);

      const result = await authService.register(payload);

      expect(userRepository.create).toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(payload.email, 'verification_token');
      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('password');
    });

    it('should handle registration failure (duplicate entry)', async () => {
      const payload = {
        username: 'existing',
        displayName: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      };

      vi.mocked(userRepository.create).mockRejectedValue(new Error('Duplicate entry'));

      await expect(authService.register(payload)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginPayload = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password', // Mocked comparePassword returns true
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(user as any);

      const result = await authService.login(loginPayload);

      expect(result).toHaveProperty('token', 'jwt_token');
      expect(result.user).toHaveProperty('email', 'test@example.com');
      expect(logger.info).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(authService.login({ email: 'unknown@example.com', password: 'pwd' }))
        .rejects.toThrow('User not found!');
    });

    it('should throw error if password is invalid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(user as any);

      // Override mock for this test
      const passwordUtils = await import('../../../src/utils/password-utils');
      vi.mocked(passwordUtils.comparePassword).mockResolvedValueOnce(false);

      await expect(authService.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials!');
    });
  });
});
