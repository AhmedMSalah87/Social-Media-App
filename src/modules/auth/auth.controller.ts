import { Router } from "express";
import authService from "./auth.service";
import { validate } from "../../middleware/validation";
import { signinSchema, signupSchema } from "./auth.validation";
const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), authService.signup);
authRouter.post("/signin", validate(signinSchema), authService.signin);

export default authRouter;
