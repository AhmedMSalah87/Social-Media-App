import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import userService from "./user.service";
import { uploadCloud } from "../../middleware/multer";
import { FileType } from "../../common/enum/user.enum";

const userRouter = Router();

userRouter.get("/profile", authenticate, userService.getProfile);
userRouter.post(
  "/upload",
  authenticate,
  uploadCloud(FileType.image, false).single("attachment"),
  userService.upload,
);

export default userRouter;
