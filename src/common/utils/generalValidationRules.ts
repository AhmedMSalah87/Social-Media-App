import { Types } from "mongoose";
import z from "zod";

export const generalRules = {
  id: z.string().refine(
    (value) => {
      return Types.ObjectId.isValid(value);
    },
    { error: "invalid objectId" },
  ),

  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    buffer: z.instanceof(Buffer).optional(),
    path: z.string().optional(),
    size: z.number(),
  }),
};
