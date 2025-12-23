import type { Request, Response } from 'express';

import userService from '../services/user.service';
import { handleControllerError } from './controller-utils';

const parseUserIdParam = (req: Request, res: Response): number | null => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({
      status: 'error',
      message: 'User id must be a number',
    });
    return null;
  }

  return id;
};

const createUser = async (req: Request, res: Response) => {
  try {
    const { username, displayName, email } = req.body;

    const user = await userService.createUser({
      username,
      displayName,
      email,
    });

    return res.json({
      status: 'success',
      message: 'User created successfully!',
      data: user,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    return res.json({
      status: 'success',
      message: 'Users data retrieved successfully!',
      data: users,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const getUser = async (req: Request, res: Response) => {
  const id = parseUserIdParam(req, res);
  if (id === null) {
    return;
  }

  try {
    const user = await userService.getUserById(id);

    return res.json({
      status: 'success',
      message: 'User data retrieved successfully!',
      data: user,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const updateUser = async (req: Request, res: Response) => {
  const id = parseUserIdParam(req, res);
  if (id === null) {
    return;
  }

  try {
    const { username, displayName, email } = req.body;

    const user = await userService.updateUser(id, {
      username,
      displayName,
      email,
    });

    return res.json({
      status: 'success',
      message: `User ${id} updated successfully`,
      data: user,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const id = parseUserIdParam(req, res);
  if (id === null) {
    return;
  }

  try {
    await userService.deleteUser(id);

    return res.json({
      status: 'success',
      message: `User successfully deleted`,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const updatePassword = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated user (set by auth middleware)
    const userId = req.userData?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    const { currentPassword, newPassword } = req.body;

    await userService.updatePassword(userId, currentPassword, newPassword);

    return res.json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const userController = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updatePassword,
};

export default userController;
