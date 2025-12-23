import { AppError } from '../errors/app-error';
import { handleDuplicateEntryError } from '../errors/error-utils';
import userRepository from '../repositories/user.repository';
import type { PublicUser } from '../types/user';
import { toPublicUser } from './user.mapper';
import logger from '../config/logger';

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

  // Log profile update (audit trail)
  logger.info({
    action: 'user_profile_updated',
    userId: id,
    email: existing.email,
    updatedFields: Object.keys(payload),
  }, 'User profile updated');

  return toPublicUser(updatedUser);
};

const deleteUser = async (id: number): Promise<void> => {
  const existing = await userRepository.findById(id);

  if (!existing) {
    throw new AppError('User not found!', 404);
  }

  await userRepository.deleteById(id);

  // Log user deletion (audit trail)
  logger.warn({
    action: 'user_deleted',
    userId: id,
    email: existing.email,
    username: existing.username,
  }, 'User deleted');
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
  const { comparePassword } = await import('../utils/password-utils');
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    // Log failed password update (audit trail)
    logger.warn({
      action: 'password_update_failed',
      userId: userId,
      email: user.email,
      reason: 'invalid_current_password',
    }, 'Password update failed - invalid current password');

    throw new AppError('Invalid credentials!', 403);
  }

  // Check if new password is same as current password
  const isSamePassword = await comparePassword(newPassword, user.password);
  if (isSamePassword) {
    // Log failed password update (audit trail)
    logger.warn({
      action: 'password_update_failed',
      userId: userId,
      email: user.email,
      reason: 'same_as_current',
    }, 'Password update failed - new password same as current');

    throw new AppError('New password must be different from current password!', 400);
  }

  // Hash new password
  const { hashPassword } = await import('../utils/password-utils');
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await userRepository.update(userId, {
    password: hashedPassword,
  });

  // Log successful password update (audit trail)
  logger.info({
    action: 'password_updated',
    userId: userId,
    email: user.email,
  }, 'User password updated successfully');
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
