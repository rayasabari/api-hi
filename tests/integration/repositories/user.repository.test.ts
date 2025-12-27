import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import userRepository from '../../../src/repositories/user.repository';
import prisma from '../../../src/config/prisma';
import { resetDb } from '../helpers/reset-db';

describe('User Repository Integration', () => {
  beforeEach(async () => {
    await resetDb(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a user', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      password: 'password123',
    };
    const user = await userRepository.create(userData);
    expect(user).toHaveProperty('id');
    expect(user.email).toBe(userData.email);
    expect(user.username).toBe(userData.username);
  });

  it('should find user by email', async () => {
    const userData = {
      email: 'find@example.com',
      username: 'finduser',
      displayName: 'Find User',
      password: 'password123',
    };
    await userRepository.create(userData);
    const found = await userRepository.findByEmail(userData.email);
    expect(found).toBeDefined();
    expect(found?.email).toBe(userData.email);
  });

  it('should find user by id', async () => {
    const userData = {
      email: 'findid@example.com',
      username: 'findiduser',
      displayName: 'Find ID User',
      password: 'password123',
    };
    const user = await userRepository.create(userData);
    const found = await userRepository.findById(user.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(user.id);
  });

  it('should find user by id with password', async () => {
    const userData = {
      email: 'password@example.com',
      username: 'passworduser',
      displayName: 'Password User',
      password: 'password123',
    };
    const user = await userRepository.create(userData);
    const found = await userRepository.findByIdWithPassword(user.id);
    expect(found).toBeDefined();
    expect(found?.password).toBe(userData.password);
  });

  it('should update user', async () => {
    const userData = {
      email: 'update@example.com',
      username: 'updateuser',
      displayName: 'Update User',
      password: 'password123',
    };
    const user = await userRepository.create(userData);
    const updated = await userRepository.update(user.id, {
      displayName: 'Updated Name'
    });
    expect(updated.displayName).toBe('Updated Name');
  });

  it('should delete user by id', async () => {
    const userData = {
      email: 'delete@example.com',
      username: 'deleteuser',
      displayName: 'Delete User',
      password: 'password123',
    };
    const user = await userRepository.create(userData);
    await userRepository.deleteById(user.id);
    const found = await userRepository.findById(user.id);
    expect(found).toBeNull();
  });

  // Reset Token tests
  it('should save and find reset token', async () => {
    const userData = {
      email: 'reset@example.com',
      username: 'resetuser',
      displayName: 'Reset User',
      password: 'password123',
    };
    await userRepository.create(userData);

    const token = 'hashed_reset_token';
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.saveResetToken(userData.email, token, expires);
    const found = await userRepository.findByResetToken(token);
    expect(found).toBeDefined();
    expect(found?.email).toBe(userData.email);
    expect(found?.resetPasswordToken).toBe(token);
  });
});
