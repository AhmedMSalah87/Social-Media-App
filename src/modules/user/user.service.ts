import { NextFunction, Request, Response } from "express";
import UserRepository from "../../database/repositories/user.repository";
import { AppError } from "../../errors/error";
import { S3Service } from "../../common/services/amazons3.service";

class UserService {
  private readonly userRepo: UserRepository = new UserRepository();
  private readonly s3Service: S3Service = new S3Service();
  constructor() {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      throw new AppError("user not found", 404);
    }
    const { firstName, lastName, email } = user;
    res.status(200).json({ user: { firstName, lastName, email } });
  };

  upload = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      throw new AppError("file is missing", 400);
    }
    if (!req.user) {
      throw new AppError("unauthorized user", 401);
    }
    await this.s3Service.uploadFile(req.file, "users", req.user?._id);
    res.status(201).json({ message: "file uploaded successfully" });
  };
}

export default new UserService();
