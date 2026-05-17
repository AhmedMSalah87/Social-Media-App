import { NextFunction, Request, Response, Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { uploadCloud } from "../../middleware/multer";
import { AppError } from "../../errors/error";
import { FileType } from "../../common/enum/user.enum";
import fileService from "./file.service";

const fileRouter = Router();

fileRouter.get(
  "/presigned-url/:fileId",
  authenticate,
  fileService.getPresignedFile,
);
fileRouter.get("/:fileId", authenticate, fileService.getFile);
fileRouter.get("/", authenticate, fileService.getFiles);
fileRouter.post("/signed-url", authenticate, fileService.createPresignedUpload);
fileRouter.post(
  "/",
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
    await fileService.upload(userId, req.file);
    res.status(201).json({ message: "file uploaded successfully" });
  },
);
fileRouter.delete("/:fileId", authenticate, fileService.deleteFile);

export default fileRouter;
