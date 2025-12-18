import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import validate from '../middleware/validation.middleware.ts';
import authMiddleware from '../middleware/auth.middleware.ts';
import { forgotPasswordLimiter } from '../middleware/rate-limit.middleware.ts';
import {
  registerUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/user.validation.ts';
import authController from '../controllers/auth.controller.ts';

const authRouter: ExpressRouter = Router();

authRouter.post('/register', validate(registerUserSchema), authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authMiddleware, authController.logout);
authRouter.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword,
);

export default authRouter;
