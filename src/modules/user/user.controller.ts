import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import userService from "./user.service";

const userRouter = Router();

userRouter.get("/profile", authenticate, userService.getProfile);

export default userRouter;
