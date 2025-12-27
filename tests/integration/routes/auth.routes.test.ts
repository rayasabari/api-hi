import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import app from '../../../src/app';
import prisma from '../../../src/config/prisma';
import { resetDb } from '../helpers/reset-db';

// Mock email service
vi.mock('../../../src/services/email.service', () => ({
  default: {
    sendVerificationEmail: vi.fn().mockResolvedValue(true),
    sendResetPasswordEmail: vi.fn().mockResolvedValue(true),
  },
}));

describe('Auth Routes Integration', () => {
  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'newuser',
        displayName: 'New User',
        email: 'new@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data.email).toBe('new@example.com');
  }, 10000);

  it('should login a user', async () => {
    // Register first
    await request(app).post('/auth/register').send({
      username: 'loginuser',
      displayName: 'Login User',
      email: 'login@example.com',
      password: 'Password123!',
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'login@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('login@example.com');
  }, 10000);

  it('should fail login with wrong password', async () => {
    await request(app).post('/auth/register').send({
      username: 'wronguser',
      displayName: 'Wrong User',
      email: 'wrong@example.com',
      password: 'Password123!',
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
  }, 10000);

  it('should initiate forgot password', async () => {
    await request(app).post('/auth/register').send({
      username: 'forgotuser',
      displayName: 'Forgot User',
      email: 'forgot@example.com',
      password: 'Password123!',
    });

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({
        email: 'forgot@example.com'
      });

    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { email: 'forgot@example.com' } });
    expect(user?.resetPasswordToken).not.toBeNull();
  }, 10000);
});
