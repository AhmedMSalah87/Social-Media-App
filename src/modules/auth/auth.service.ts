import { Request, Response, NextFunction } from "express";
import { CreateUserDTO, SignInDTO } from "./auth.dto";
import { AppError } from "../../errors/error";
import { compareValue, hashValue } from "../../common/utils/hash";
import { signToken } from "../../common/utils/signToken";
import UserRepository from "../../database/repositories/user.repository";
import { sendEmailVerification } from "../../common/utils/email/sendEmail";
import { generateOTP } from "../../common/utils/generateOTP";

class AuthService {
  constructor(
    private readonly userRepo: UserRepository = new UserRepository(),
  ) {}

  signup = async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName, email, password, gender }: CreateUserDTO =
      req.body;
    if (await this.userRepo.isEmailExist(email)) {
      throw new AppError("email already exists", 409);
    }
    const hashedPassword = await hashValue(password);
    await this.userRepo.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
    });

    const otp = generateOTP();
    await sendEmailVerification(email, otp);

    res.status(201).json({
      message: "user created successfully",
    });
  };

  signin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: SignInDTO = req.body;
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError("user not found", 404);
    }
    const isMatched = await compareValue(password, user.password);
    if (!isMatched) {
      throw new AppError("invalid password", 400);
    }
    const { accessToken, refreshToken } = signToken(user);
    res.status(200).json({
      message: "user logged in successfully",
      accessToken,
      refreshToken,
    });
  };
}

export default new AuthService();
