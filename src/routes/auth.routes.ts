import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import validate from '../middleware/validation.middleware.ts';
import { registerUserSchema } from '../validations/user.validation.ts';

import authController from '../controllers/auth.controller.ts';

const authRouter: ExpressRouter = Router();

authRouter.post('/register', validate(registerUserSchema), authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);

export default authRouter;
