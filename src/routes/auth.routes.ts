import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import validate from '../middleware/validateResource.ts';
import { registerUserSchema } from '../validations/userValidation.ts';

import authController from '../controllers/auth/authController.ts';

const authRouter: ExpressRouter = Router();

authRouter.post('/register', validate(registerUserSchema), authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authController.logout);

export default authRouter;
