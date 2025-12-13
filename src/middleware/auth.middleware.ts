import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import env from '../config/env.ts';
import type { PublicUser } from '../types/user.ts';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Access token not found!',
    });
  }

  const [, token] = authorizationHeader.split(' ');

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid access token!',
    });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === 'object') {
      const payload = decoded as jwt.JwtPayload & Partial<PublicUser>;

      if (
        typeof payload.id === 'number' &&
        typeof payload.username === 'string' &&
        typeof payload.email === 'string'
      ) {
        req.userData = {
          id: payload.id,
          username: payload.username,
          displayName:
            typeof payload.displayName === 'string' ? payload.displayName : null,
          email: payload.email,
        };
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid access token!',
    });
  }
};

export default authMiddleware;
