import type { Request, Response } from 'express';
import authService from '../services/auth.service.ts';
import { handleControllerError } from './controller-utils.ts';
import logger from '../config/logger.ts';

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

const logout = (req: Request, res: Response) => {
  logger.info({
    action: 'user_logout',
    userId: req.userData?.id,
  }, 'User logged out');

  return res.json({
    status: 'success',
    message: 'User logged out successfully!',
  });
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await authService.forgotPassword(email);

    return res.json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const result = await authService.resetPassword(token, password);

    return res.json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const result = await authService.verifyEmail(token);

    return res.json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await authService.resendVerification(email);

    return res.json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
};

const authController = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};

export default authController;
