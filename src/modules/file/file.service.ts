import { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors/error";
import { Types } from "mongoose";
import { randomUUID } from "node:crypto";
import { FileRepository } from "../../database/repositories/file.repository";
import s3Service from "../../common/services/amazons3.service";
import { fileDTO } from "./file.dto";
import { pipeline } from "node:stream/promises";

class FileService {
  private readonly fileRepo: FileRepository = new FileRepository();
  private readonly s3Serv = s3Service;
  constructor() {}

  upload = async (userId: Types.ObjectId, file: Express.Multer.File) => {
    const fileId = randomUUID();
    const fileKey = `users/${userId}/posts/${fileId}__${file.originalname}`;
    await this.s3Serv.uploadFile(file, fileKey);
    return fileKey;
  };

  createPresignedUpload = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { fileName, fileType }: fileDTO = req.body;
    if (!req.user) {
      throw new AppError("unauthorized user", 401);
    }
    const fileUniqueName = `${randomUUID()}-${fileName}`;
    const path = `users/${req.user._id}/${fileUniqueName}`;
    const url = await this.s3Serv.generatePresignedURL(path, fileType);
    res.status(201).json({ message: "url generted successfully", url });
  };

  getFile = async (
    req: Request<{ fileId: string }, {}, {}, { download: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { fileId } = req.params;
    const { download } = req.query;
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError("unauthorized user", 401);
    }
    const fileData = await this.fileRepo.findOne({ fileId, userId });
    const key = fileData?.s3Key;
    if (!key) {
      throw new AppError("invalid file", 404);
    }
    const result = await this.s3Serv.getFileFromS3(key);
    const stream = result.Body as ReadableStream;
    if (download && download === "true") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileData?.fileName}"`,
      );
    }
    await pipeline(stream, res);
  };

  getPresignedFile = async (
    req: Request<{ fileId: string }, {}, {}, { download: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { fileId } = req.params;
    const { download } = req.query;
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError("unauthorized user", 401);
    }
    const fileData = await this.fileRepo.findOne({ fileId, userId });
    const key = fileData?.s3Key;
    if (!key) {
      throw new AppError("invalid file", 404);
    }
    const url = await this.s3Serv.getFileFromPresignedUrl(key, download);
    res.status(200).json(url);
  };

  getFiles = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError("unauthorized user", 401);
    }
    const result = await this.s3Serv.getFilesFromS3("users", userId);
    const filesList = result.Contents?.map((item) => item.Key);

    res.status(200).json(filesList);
  };

  deleteFile = async (
    req: Request<{ fileId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { fileId } = req.params;
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError("unauthorized user", 401);
    }
    const file = await this.fileRepo.findOneAndDelete({ fileId, userId });
    const key = file?.s3Key;
    if (!key) {
      throw new AppError("invalid file", 400);
    }
    const result = await this.s3Serv.deleteFileFromS3(key);
    res.status(200).json(result);
  };
}

export default new FileService();
