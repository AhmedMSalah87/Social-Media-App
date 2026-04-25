import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "../errors/error";

type ReqType = keyof Request;
type SchemaType = Partial<Record<ReqType, ZodType>>;

export const validate = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors = [];
    for (const key of Object.keys(schema) as ReqType[]) {
      const result = schema[key]?.safeParse(req[key]);
      if (!result?.success && result?.error) {
        const errors = result.error.issues.map((issue) => {
          return {
            path: issue.path[0],
            code: issue.code,
            message: issue.message,
          };
        });
        validationErrors.push(...errors);
      }
    }

    if (validationErrors.length > 0) {
      throw new ValidationError("Invalid Inputs", validationErrors);
    }

    next();
  };
};
