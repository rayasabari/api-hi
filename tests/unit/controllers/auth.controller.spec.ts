import { describe, it, expect, vi, beforeEach } from 'vitest';
import authController from '../../../src/controllers/auth.controller';
import authService from '../../../src/services/auth.service';
import logger from '../../../src/config/logger';

vi.mock('../../../src/services/auth.service');
vi.mock('../../../src/config/logger', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Auth Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      body: {},
      userData: { id: 1 },
    };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
  });

  describe('register', () => {
    it('should register a user and return success response', async () => {
      req.body = {
        username: 'test',
        email: 'test@example.com',
        password: 'pass',
      };

      const mockUser = { id: 1, username: 'test', email: 'test@example.com' };
      vi.mocked(authService.register).mockResolvedValue(mockUser as any);

      await authController.register(req, res);

      expect(authService.register).toHaveBeenCalledWith({
        username: 'test',
        displayName: undefined, // req.body.displayName was undefined
        email: 'test@example.com',
        password: 'pass',
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User created successfully!',
        data: mockUser,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Registration failed');
      vi.mocked(authService.register).mockRejectedValue(error);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('login', () => {
    it('should login a user and return token', async () => {
      req.body = { email: 'test@example.com', password: 'pass' };
      const mockResult = { user: { id: 1 }, token: 'abc' };

      vi.mocked(authService.login).mockResolvedValue(mockResult as any);

      await authController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass',
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User logged in successfully!',
        data: mockResult,
      });
    });
  });

  describe('logout', () => {
    it('should logout user', () => {
      authController.logout(req, res);

      expect(logger.info).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User logged out successfully!',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should call forgotPassword service', async () => {
      req.body = { email: 'test@example.com' };
      vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'Sent' });

      await authController.forgotPassword(req, res);

      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Sent',
      });
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword service', async () => {
      req.body = { token: 'tok', password: 'new' };
      vi.mocked(authService.resetPassword).mockResolvedValue({ message: 'Reset' });

      await authController.resetPassword(req, res);

      expect(authService.resetPassword).toHaveBeenCalledWith('tok', 'new');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Reset',
      });
    });
  });

  describe('verifyEmail', () => {
    it('should call verifyEmail service', async () => {
      req.body = { token: 'tok' };
      vi.mocked(authService.verifyEmail).mockResolvedValue({ message: 'Verified' });

      await authController.verifyEmail(req, res);

      expect(authService.verifyEmail).toHaveBeenCalledWith('tok');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Verified',
      });
    });
  });

  describe('resendVerification', () => {
    it('should call resendVerification service', async () => {
      req.body = { email: 'test@example.com' };
      vi.mocked(authService.resendVerification).mockResolvedValue({ message: 'Resent' });

      await authController.resendVerification(req, res);

      expect(authService.resendVerification).toHaveBeenCalledWith('test@example.com');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Resent',
      });
    });
  });
});
