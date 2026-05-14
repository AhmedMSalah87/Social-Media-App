import { NextFunction, Request, Response, Router } from "express";
import { authenticate } from "../../middleware/authentication";
import userService from "./user.service";
import { uploadCloud } from "../../middleware/multer";
import { FileType } from "../../common/enum/user.enum";
import { AppError } from "../../errors/error";

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
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      throw new AppError("file is missing", 400);
    }
    if (!req.user) {
      throw new AppError("unauthorized user", 401);
    }
    const userId = req.user._id;
    await userService.upload(userId, req.file);
    res.status(201).json({ message: "file uploaded successfully" });
  },
);
userRouter.delete("/upload/:fileId", authenticate, userService.deleteFile);

export default userRouter;
