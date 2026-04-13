import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { AppError, ValidationError } from "../errors/error";

type reqType = keyof Request;
type schemaType = Partial<Record<reqType, ZodType>>;

export const validate = (schema: schemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors = [];
    for (const key of Object.keys(schema) as reqType[]) {
      const result = schema[key]?.safeParse(req[key]);
      if (!result?.success && result?.error) {
        validationErrors.push(...result?.error.issues);
      }
    }

    if (validationErrors.length > 0) {
      throw new ValidationError("Invalid Inputs", validationErrors);
    }

    next();
  };
};
