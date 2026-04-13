import z from "zod";
import { Gender } from "../../common/enum/user.enum";

export const signupSchema = {
  body: z.object({
    firstName: z.string().min(2).max(20),
    lastName: z.string().min(2).max(20),
    email: z.email(),
    password: z.string().min(8).max(20),
    gender: z.enum(Object.values(Gender)),
  }),
};

export const signinSchema = {
  body: signupSchema.body.pick({ email: true, password: true }),
};
