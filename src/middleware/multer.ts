import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { AppError } from "../errors/error";
import { tmpdir } from "node:os";

export const uploadCloud = (fileType: string[], isLarge: boolean) => {
  const memoryStorage = multer.memoryStorage();
  const deskStorage = multer.diskStorage({
    destination: tmpdir(),
    filename: function (req: Request, file: Express.Multer.File, cb: Function) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });
  const storage = isLarge ? deskStorage : memoryStorage;
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (!fileType.includes(file.mimetype)) {
      cb(new AppError("file not supported", 400));
    } else {
      cb(null, true);
    }
  };

  return multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
};
