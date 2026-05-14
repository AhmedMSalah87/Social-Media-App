import z from "zod";
import { Gender } from "../../common/enum/user.enum";

export const signupSchema = z.object({
  body: z.strictObject({
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
    email: z.email(),
    password: z.string().min(8).max(20),
    gender: z.enum(Object.values(Gender)),
  }),
});

export const signinSchema = z.object({
  body: z.strictObject({
    email: z.email(),
    password: z.string(),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.strictObject({
    otp: z.string().length(6),
    email: z.email(),
  }),
});
