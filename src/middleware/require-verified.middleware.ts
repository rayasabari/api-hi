import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/prisma';
import logger from '../config/logger';

const requireVerifiedEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.userData?.id) {
    logger.warn({
      action: 'require_verified_email_failed',
      reason: 'unauthorized',
      path: req.path,
    }, 'Require verified email middleware - user not authenticated');

    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userData.id },
    select: { emailVerified: true, email: true },
  });

  if (!user?.emailVerified) {
    // Log access attempt with unverified email (audit trail)
    logger.warn({
      action: 'unverified_email_access_attempt',
      userId: req.userData.id,
      email: user?.email,
      path: req.path,
      method: req.method,
    }, 'Access denied - email not verified');

    return res.status(403).json({
      status: 'error',
      message: 'Please verify your email address first',
    });
  }

  // Log successful verification check (audit trail)
  logger.debug({
    action: 'verified_email_check_passed',
    userId: req.userData.id,
    path: req.path,
  }, 'Email verification check passed');

  next();
};

export default requireVerifiedEmail;
