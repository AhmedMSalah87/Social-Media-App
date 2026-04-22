import { NextFunction, Request, Response } from "express";
import tokenService from "../common/services/token.service";
import { AppError } from "../errors/error";
import UserRepository from "../database/repositories/user.repository";

const userRepo = new UserRepository();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = tokenService.getToken(req);
  if (!token) {
    throw new AppError("no token provided", 401);
  }

  const decoded = tokenService.verifyToken(token);

  const user = await userRepo.findById(decoded.id, { password: 0 });

  if (!user) {
    throw new AppError("user not found", 404);
  }

  req.user = user;

  next();
};
