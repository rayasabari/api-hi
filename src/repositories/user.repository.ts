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

const userRepository = {
  create,
  findByEmail,
  findById,
  findByIdWithPassword,
  findAll,
  update,
  deleteById,
};

export default userRepository;
