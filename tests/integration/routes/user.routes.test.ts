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

describe('User Routes Integration', () => {
  let token: string;
  let userId: number;

  beforeEach(async () => {
    await resetDb(prisma);

    // Create user and get token
    const regRes = await request(app).post('/auth/register').send({
      username: 'authuser',
      displayName: 'Auth User',
      email: 'auth@example.com',
      password: 'Password123!',
    });

    const loginRes = await request(app).post('/auth/login').send({
      email: 'auth@example.com',
      password: 'Password123!'
    });

    if (loginRes.status !== 200) {
      console.error('Login failed in beforeEach:', JSON.stringify(loginRes.body));
    }

    // Access data property
    token = loginRes.body.data?.token;
    userId = loginRes.body.data?.user?.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should get all users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  }, 10000);

  it('should get user by id', async () => {
    const res = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
  }, 10000);

  it('should fail without auth token', async () => {
    const res = await request(app)
      .get('/users');

    expect(res.status).toBe(401);
  }, 10000);

  it('should update user', async () => {
    const res = await request(app)
      .put(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'Updated Name',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.displayName).toBe('Updated Name');
  }, 10000);

  it('should fail delete user without verified email', async () => {
    const res = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
  }, 10000);

  it('should delete user with verified email', async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true }
    });

    const res = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const check = await prisma.user.findUnique({ where: { id: userId } });
    expect(check).toBeNull();
  }, 10000);
});
