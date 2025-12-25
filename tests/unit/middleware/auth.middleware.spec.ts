import { describe, it, expect, vi, beforeEach } from 'vitest';
import authMiddleware from '../../../src/middleware/auth.middleware';
import jwt from 'jsonwebtoken';

vi.mock('../../../src/config/env', () => ({
  default: {
    jwtSecret: 'secret',
  },
}));

describe('Auth Middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should return 401 if authorization header is missing', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Access token not found!' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is missing in header', () => {
    req.headers.authorization = 'Bearer ';
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid access token!' }));
  });

  it('should call next and set userData if token is valid', () => {
    req.headers.authorization = 'Bearer validtoken';
    const payload = { id: 1, username: 'user', email: 'test@example.com' };

    vi.spyOn(jwt, 'verify').mockReturnValue(payload as any);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', 'secret');
    expect(req.userData).toEqual({
      id: 1,
      username: 'user',
      displayName: null,
      email: 'test@example.com',
    });
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.headers.authorization = 'Bearer invalidtoken';
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid access token!' }));
    expect(next).not.toHaveBeenCalled();
  });
});
