import z from "zod";
import { signinSchema, signupSchema } from "./auth.validation";

export type CreateUserDTO = z.infer<typeof signupSchema.body>;
export type SignInDTO = z.infer<typeof signinSchema.body>;
