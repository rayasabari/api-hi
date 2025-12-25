import { describe, it, expect, vi, beforeEach } from 'vitest';
import validate from '../../../src/middleware/validation.middleware';
import { z } from 'zod';

describe('Validation Middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  const schema = z.object({
    body: z.object({
      name: z.string().min(1),
    }),
  });

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it('should call next if validation passes', () => {
    req.body = { name: 'test' };
    const middleware = validate(schema);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 if validation fails', () => {
    req.body = { name: '' }; // Invalid
    const middleware = validate(schema);

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'error',
      message: 'Bad request',
    }));
  });

  it('should return 500 if unknown error occurs', () => {
    const errorSchema = z.object({
      body: z.object({
        name: z.string().refine(() => { throw new Error('Unexpected'); }),
      }),
    });

    req.body = { name: 'test' };
    const middleware = validate(errorSchema);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Internal server error',
    }));
  });
});
