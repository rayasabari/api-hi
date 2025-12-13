import { z } from "zod";

export const requiredString = (message = "This field is required") => {
  return z
    .string()
    .trim()
    .pipe(z.string().min(1, message));
};
