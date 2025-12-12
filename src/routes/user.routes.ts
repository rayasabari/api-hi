import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import validate from '../middleware/validateResource.ts';
import { createUserSchema } from '../validations/userValidation.ts';

import userController from '../controllers/user/userController.ts';
import accessValidation from '../middleware/accessValidation.ts';

const userRouter: ExpressRouter = Router();

userRouter.post('/', validate(createUserSchema), userController.createUser);
userRouter.get('/', accessValidation, userController.getUsers);
userRouter.get('/:id', accessValidation, userController.getUser);
userRouter.put('/:id', accessValidation, userController.updateUser);
userRouter.delete('/:id', accessValidation, userController.deleteUser);

export default userRouter;
