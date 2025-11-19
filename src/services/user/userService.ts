import { AppError } from '../../errors/AppError.ts';
import userRepository from '../../repositories/user/userRepository.ts';
import type { PublicUser } from '../../types/user.ts';
import { toPublicUser } from '../mappers/userMapper.ts';

type CreateUserInput = {
  username: string;
  displayName: string;
  email: string;
};

type UpdateUserInput = Partial<CreateUserInput>;

const createUser = async (payload: CreateUserInput): Promise<PublicUser> => {
  const user = await userRepository.create(payload);
  return toPublicUser(user);
};

const getAllUsers = async (): Promise<PublicUser[]> => {
  const users = await userRepository.findAll();
  return users.map(toPublicUser);
};

const getUserById = async (id: number): Promise<PublicUser> => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new AppError('User not found!', 404);
  }

  return toPublicUser(user);
};

const updateUser = async (
  id: number,
  payload: UpdateUserInput,
): Promise<PublicUser> => {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new AppError('User not found!', 404);
  }

  const updatedUser = await userRepository.update(id, payload);
  return toPublicUser(updatedUser);
};

const deleteUser = async (id: number): Promise<void> => {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new AppError('User not found!', 404);
  }

  await userRepository.deleteById(id);
};

const userService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

export default userService;
