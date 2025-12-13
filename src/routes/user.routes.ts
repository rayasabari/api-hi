import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import authMiddleware from '../middleware/auth.middleware.ts';
import validate from '../middleware/validation.middleware.ts';
import { createUserSchema, updateUserSchema } from '../validations/user.validation.ts';
import userController from '../controllers/user.controller.ts';


const userRouter: ExpressRouter = Router();

userRouter.post('/', authMiddleware, validate(createUserSchema), userController.createUser);
userRouter.get('/', authMiddleware, userController.getUsers);
userRouter.get('/:id', authMiddleware, userController.getUser);
userRouter.put('/:id', authMiddleware, validate(updateUserSchema), userController.updateUser);
userRouter.delete('/:id', authMiddleware, userController.deleteUser);

export default userRouter;
