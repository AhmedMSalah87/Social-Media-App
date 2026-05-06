import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import userService from "./user.service";
import { uploadCloud } from "../../middleware/multer";
import { FileType } from "../../common/enum/user.enum";

const userRouter = Router();

userRouter.get("/profile", authenticate, userService.getProfile);
userRouter.get(
  "/upload/presigned-url/:fileId",
  authenticate,
  userService.getPresignedFile,
);
userRouter.get("/upload/:fileId", authenticate, userService.getFile);
userRouter.get("/upload", authenticate, userService.getFiles);
userRouter.post(
  "/upload/signed-url",
  authenticate,
  userService.createPresignedUpload,
);
userRouter.post(
  "/upload",
  authenticate,
  uploadCloud(FileType.image, false).single("attachment"),
  userService.upload,
);
userRouter.delete("/upload/:fileId", authenticate, userService.deleteFile);

export default userRouter;
