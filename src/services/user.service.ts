import { AppError } from '../errors/app-error.ts';
import { handleDuplicateEntryError } from '../errors/error-utils.ts';
import userRepository from '../repositories/user.repository.ts';
import type { PublicUser } from '../types/user.ts';
import { toPublicUser } from './user.mapper.ts';

type CreateUserInput = {
  username: string;
  displayName: string;
  email: string;
};

type UpdateUserInput = Partial<CreateUserInput>;

const createUser = async (payload: CreateUserInput): Promise<PublicUser> => {
  try {
    const user = await userRepository.create(payload);
    return toPublicUser(user);
  } catch (error) {
    return handleDuplicateEntryError(error);
  }
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

const updatePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  // Get user with password field
  const user = await userRepository.findByIdWithPassword(userId);

  if (!user) {
    throw new AppError('User not found!', 404);
  }

  // Check if user has a password set
  if (!user.password) {
    throw new AppError('Password not set for this user!', 400);
  }

  // Verify current password
  const { comparePassword } = await import('../utils/password-utils.ts');
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials!', 403);
  }

  // Check if new password is same as current password
  const isSamePassword = await comparePassword(newPassword, user.password);
  if (isSamePassword) {
    throw new AppError('New password must be different from current password!', 400);
  }

  // Hash new password
  const { hashPassword } = await import('../utils/password-utils.ts');
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await userRepository.update(userId, {
    password: hashedPassword,
  });
};

const userService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword,
};

export default userService;
