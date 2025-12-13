import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import {  handleDuplicateEntryError } from '../errors/error-utils.ts';

import env from '../config/env.ts';
import { AppError } from '../errors/app-error.ts';
import userRepository from '../repositories/user.repository.ts';
import type { PublicUser } from '../types/user.ts';
import { toPublicUser } from './user.mapper.ts';

type RegisterInput = {
  username: string;
  displayName: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const register = async (payload: RegisterInput): Promise<PublicUser> => {
  try {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
  
    const user = await userRepository.create({
      username: payload.username,
      displayName: payload.displayName,
      email: payload.email,
      password: hashedPassword,
    });
  
    return toPublicUser(user);
  } catch (error) {
    return handleDuplicateEntryError(error);
  }
};

const login = async (
  payload: LoginInput,
): Promise<{ user: PublicUser; token: string }> => {
  const user = await userRepository.findByEmail(payload.email);

  if (!user) {
    throw new AppError('User not found!', 401);
  }

  if (!user.password) {
    throw new AppError('Password not set!', 401);
  }

  const passwordValid = await bcrypt.compare(payload.password, user.password);

  if (!passwordValid) {
    throw new AppError('Invalid credentials!', 401);
  }

  const publicUser = toPublicUser(user);
  const secret: Secret = env.jwtSecret;
  const token = jwt.sign(
    publicUser,
    secret,
    {
      expiresIn: env.jwtExpiration,
    } as SignOptions,
  );

  return {
    user: publicUser,
    token,
  };
};

const authService = {
  register,
  login,
};

export default authService;
