import { z } from 'zod';
import { requiredString } from '../utils/zod-helper';

export const passwordSchema = (fieldName = "Password") => {
  return requiredString(`${fieldName} is required`)
    .pipe(
      z.string()
        .min(8, `${fieldName} must be at least 8 characters`)
        .max(100, `${fieldName} must be at most 100 characters`)
        .regex(/[A-Z]/, `${fieldName} must contain at least one uppercase letter`)
        .regex(/[a-z]/, `${fieldName} must contain at least one lowercase letter`)
        .regex(/[0-9]/, `${fieldName} must contain at least one number`)
    );
};
