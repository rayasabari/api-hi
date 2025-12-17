import type { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {

        const formattedErrors = error.issues.map(issue => ({
          parameter: issue.path[1] ? issue.path[1].toString() : '',
          message: issue.message,
        }));

        return res.status(400).json({
          status: "error",
          message: "Bad request",
          errors: formattedErrors,
        });
      }

      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };
}

export default validate;