import { Prisma } from '../../generated/prisma/client.ts';
import { AppError } from './AppError.ts';

/**
 * Handles Prisma's P2002 error (unique constraint violation) by throwing a 409 Conflict AppError.
 * Re-throws any other error.
 * @param error The error object to check.
 * @param conflictMessage An optional custom message for the conflict error.
 */
export const handleDuplicateEntryError = (
  error: unknown,
  conflictMessage?: string,
) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const defaultMessage = 'A record with the provided value already exists.';
    throw new AppError(conflictMessage || defaultMessage, 409);
  }

  // Re-throw if it's not the error we're looking for
  throw error;
};
