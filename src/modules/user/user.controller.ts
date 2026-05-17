import { NextFunction, Request, Response, Router } from "express";
import { authenticate } from "../../middleware/authentication";
import userService from "./user.service";
import { uploadCloud } from "../../middleware/multer";
import { FileType } from "../../common/enum/user.enum";
import { AppError } from "../../errors/error";

const userRouter = Router();

userRouter.get("/profile", authenticate, userService.getProfile);

export default userRouter;
