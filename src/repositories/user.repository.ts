import type { Prisma, User } from '../../generated/prisma/client.ts';
import prisma from '../config/prisma.ts';

const create = (data: Prisma.UserCreateInput): Promise<User> =>
  prisma.user.create({ data });

const findByEmail = (email: string): Promise<User | null> =>
  prisma.user.findUnique({ where: { email } });

const findById = (id: number): Promise<User | null> =>
  prisma.user.findUnique({ where: { id } });

const findByIdWithPassword = (id: number): Promise<User | null> =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      password: true,
      emailVerified: true,
      emailVerificationToken: true,
      emailVerificationExpires: true,
      resetPasswordToken: true,
      resetPasswordExpires: true,
      createdAt: true,
      updatedAt: true,
    },
  });

const findAll = (): Promise<User[]> => prisma.user.findMany();

const update = (id: number, data: Prisma.UserUpdateInput): Promise<User> =>
  prisma.user.update({
    where: { id },
    data,
  });

const deleteById = (id: number): Promise<User> =>
  prisma.user.delete({ where: { id } });

const saveResetToken = async (
  email: string,
  hashedToken: string,
  expiresAt: Date,
): Promise<User> =>
  prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
    },
  });

const findByResetToken = async (
  hashedToken: string,
): Promise<User | null> =>
  prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        gt: new Date(), // not expired token
      },
    },
  });

const clearResetToken = async (userId: number): Promise<User> =>
  prisma.user.update({
    where: { id: userId },
    data: {
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

const updatePassword = async (
  userId: number,
  hashedPassword: string,
): Promise<User> =>
  prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

const saveVerificationToken = async (
  userId: number,
  token: string,
  expiresAt: Date,
): Promise<User> =>
  prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationExpires: expiresAt,
    },
  });

const findByVerificationToken = async (
  token: string,
): Promise<User | null> =>
  prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        gt: new Date(), // not expired token
      },
    },
  });

const clearVerificationToken = async (userId: number): Promise<User> =>
  prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

const userRepository = {
  create,
  findByEmail,
  findById,
  findByIdWithPassword,
  findAll,
  update,
  deleteById,
  saveResetToken,
  findByResetToken,
  clearResetToken,
  updatePassword,
  saveVerificationToken,
  findByVerificationToken,
  clearVerificationToken,
};

export default userRepository;
