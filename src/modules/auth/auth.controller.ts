import { Router } from "express";
import authService from "./auth.service";
import { validate } from "../../middleware/validation";
import {
  signinSchema,
  signupSchema,
  verifyEmailSchema,
} from "./auth.validation";
const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), authService.signup);
authRouter.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authService.verifyEmail,
);
authRouter.post("/signin", validate(signinSchema), authService.signin);
authRouter.post("/google", authService.signWithGoogle);

export default authRouter;
