import z from "zod";
import {
  signinSchema,
  signupSchema,
  verifyEmailSchema,
} from "./auth.validation";

export type CreateUserDTO = z.infer<typeof signupSchema.shape.body>;
export type SignInDTO = z.infer<typeof signinSchema.shape.body>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema.shape.body>;
