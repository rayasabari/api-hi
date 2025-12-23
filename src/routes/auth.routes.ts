import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import validate from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';
import { forgotPasswordLimiter, resendVerificationLimiter } from '../middleware/rate-limit.middleware';
import {
  registerUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from '../validations/user.validation';
import authController from '../controllers/auth.controller';

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
authRouter.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail,
);
authRouter.post(
  '/resend-verification',
  resendVerificationLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification,
);

export default authRouter;
