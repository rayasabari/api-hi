import { describe, it, expect } from 'vitest';
import { AppError } from '../../../src/errors/app-error';

describe('AppError', () => {
  it('should create an instance with message and status code', () => {
    const error = new AppError('Something went wrong', 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AppError');
  });

  it('should default status code to 500 if not provided', () => {
    const error = new AppError('Server error');

    expect(error.statusCode).toBe(500);
  });
});
