import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import authMiddleware from '../middleware/auth.middleware';
import requireVerifiedEmail from '../middleware/require-verified.middleware';
import validate from '../middleware/validation.middleware';
import { createUserSchema, updateUserSchema, updatePasswordSchema } from '../validations/user.validation';
import userController from '../controllers/user.controller';


const userRouter: ExpressRouter = Router();

userRouter.post('/', authMiddleware, requireVerifiedEmail, validate(createUserSchema), userController.createUser);
userRouter.get('/', authMiddleware, userController.getUsers);
userRouter.patch('/password', authMiddleware, validate(updatePasswordSchema), userController.updatePassword);
userRouter.get('/:id', authMiddleware, userController.getUser);
userRouter.put('/:id', authMiddleware, validate(updateUserSchema), userController.updateUser);
userRouter.delete('/:id', authMiddleware, requireVerifiedEmail, userController.deleteUser);

export default userRouter;
