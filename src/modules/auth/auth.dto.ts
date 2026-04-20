import z from "zod";
import {
  signinSchema,
  signupSchema,
  verifyEmailSchema,
} from "./auth.validation";

export type CreateUserDTO = z.infer<typeof signupSchema.body>;
export type SignInDTO = z.infer<typeof signinSchema.body>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema.body>;
