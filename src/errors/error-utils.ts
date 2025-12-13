import { Prisma } from '../../generated/prisma/client.ts';
import { AppError } from './app-error.ts';
import { camelCaseToTitleCase } from '../utils/string-utils.ts';

/**
 * Handles Prisma's P2002 error (unique constraint violation) by throwing a 409 Conflict AppError
 * with a specific message based on the violated field(s).
 * Re-throws any other error.
 * @param error The error object to check.
 */
export const handleDuplicateEntryError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const targetValue = error.meta?.target;
    let target: string[] = [];
    if (targetValue) {
      if (Array.isArray(targetValue)) {
        target = targetValue.filter((v): v is string => typeof v === 'string');
      } else if (typeof targetValue === 'string') {
        target = [targetValue];
      }
    }

    let message = 'A record with the provided value already exists.';

    if (target.length === 1) {
      const field = target[0];
      if (field) {
        // Single field unique constraint
        const fieldName = camelCaseToTitleCase(field);
        message = `${fieldName} already exists.`;
      }
    } else if (target.length > 1) {
      // Compound unique constraint
      const formattedFields = target.map(camelCaseToTitleCase).join(', ');
      message = `Combination of fields (${formattedFields}) already exists.`;
    }

    throw new AppError(message, 409);
  }

  // Re-throw if it's not the error we're looking for
  throw error;
};
