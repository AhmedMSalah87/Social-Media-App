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
authRouter.post("/password/forgot", authService.forgetPassword);
authRouter.post("/password/verify", authService.verifyForgotPassword);
authRouter.patch("/password/reset", authService.resetPassword);
authRouter.post("/resend-otp", authService.resendOTP);

export default authRouter;
