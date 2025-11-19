import type { Request, Response } from 'express';

import authService from '../../services/auth/authService.ts';
import { handleControllerError } from '../shared/controllerUtils.ts';

const register = async (req: Request, res: Response) => {
  try {
    const { username, displayName, email, password } = req.body;

    const user = await authService.register({
      username,
      displayName,
      email,
      password,
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

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({
      email,
      password,
    });

    return res.json({
      status: 'success',
      message: 'User logged in successfully!',
      data: result,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const logout = (_req: Request, res: Response) =>
  res.json({
    status: 'success',
    message: 'User logged out successfully!',
  });

const authController = {
  register,
  login,
  logout,
};

export default authController;
