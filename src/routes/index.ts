import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

import authRoutes from './auth.routes.ts';
import userRoutes from './user.routes.ts';

const router: ExpressRouter = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
