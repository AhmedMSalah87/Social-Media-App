import { NextFunction, Request, Response } from "express";
import UserRepository from "../../database/repositories/user.repository";
import { AppError } from "../../errors/error";
class UserService {
  private readonly userRepo: UserRepository = new UserRepository();
  constructor() {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      throw new AppError("user not found", 404);
    }
    const { firstName, lastName, email } = user;
    res.status(200).json({ user: { firstName, lastName, email } });
  };
}

export default new UserService();
