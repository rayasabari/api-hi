import type { Response } from 'express';

import { AppError } from '../../errors/AppError.ts';

export const handleControllerError = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  console.error(error);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
