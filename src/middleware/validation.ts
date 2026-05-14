import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "../errors/error";

type ParsedRequest = {
  body?: Record<string, any>;
  params?: Record<string, string>;
  query?: Record<string, string>;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
};

export const validate = <T extends ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      file: req.file,
      files: req.files,
    });

    if (!result.success) {
      const validationErrors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: issue.code,
        message: issue.message,
      }));

      throw new ValidationError("Invalid Inputs", validationErrors);
    }
    const data = result.data as ParsedRequest;

    if (data.body !== undefined) req.body = data.body;
    if (data.params !== undefined) req.params = data.params;
    if (data.query !== undefined) req.query = data.query;
    if (data.file !== undefined) req.file = data.file;
    if (data.files !== undefined) req.files = data.files;

    next();
  };
};
// type ReqType = keyof Request;
// type SchemaType = Partial<Record<ReqType, ZodType>>;

// export const validate = (schema: SchemaType) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const validationErrors = [];
//     for (const key of Object.keys(schema) as ReqType[]) {
//       const result = schema[key]?.safeParse(req[key]);
//       if (!result?.success && result?.error) {
//         const errors = result.error.issues.map((issue) => {
//           return {
//             path: issue.path[0],
//             code: issue.code,
//             message: issue.message,
//           };
//         });
//         validationErrors.push(...errors);
//       }
//     }

//     if (validationErrors.length > 0) {
//       throw new ValidationError("Invalid Inputs", validationErrors);
//     }

//     next();
//   };
// };
