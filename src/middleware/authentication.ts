import { NextFunction, Request, Response } from "express";
import { getToken } from "../common/utils/getToken";
import { AppError } from "../errors/error";
import UserModel from "../database/models/user.model";
import { verifyToken } from "../common/utils/verifyToken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = getToken(req);
  if (!token) {
    throw new AppError("no token provided", 401);
  }

  const decoded = verifyToken(token);

  const user = UserModel.findById(decoded.id);

  // req.user = user;

  next();
};
