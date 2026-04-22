import { Request, Response, NextFunction } from "express";
import { CreateUserDTO, SignInDTO, VerifyEmailDTO } from "./auth.dto";
import { AppError } from "../../errors/error";
import { compareValue, hashValue } from "../../common/utils/hash";
import UserRepository from "../../database/repositories/user.repository";
import { eventEmitter } from "../../common/utils/email/emailEvents";
import { UserEvents } from "../../common/enum/user.enum";
import redisService from "../../common/services/redis.service";
import { OTPKeys } from "../../common/utils/otpKeys";
import tokenService from "../../common/services/token.service";

class AuthService {
  private readonly userRepo: UserRepository = new UserRepository();
  private readonly redisRepo = redisService;
  constructor() {}

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

    eventEmitter.emit(UserEvents.confirmEmail, email);

    res.status(201).json({
      message: "user created successfully. OTP sent to your email",
    });
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp }: VerifyEmailDTO = req.body;
    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new AppError("user not found", 404);
    }
    const hashedOTP = await this.redisRepo.getCache(OTPKeys.otp(email));

    if (!hashedOTP) {
      throw new AppError("OTP has expired", 401);
    }

    const isMatched = await compareValue(otp, hashedOTP);

    if (!isMatched) {
      throw new AppError("Invalid OTP", 400);
    }

    user.isVerified = true;
    await user.save();

    await this.redisRepo.deleteCache(OTPKeys.otp(email));

    res.status(200).json({ message: "email verified successfully" });
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
    const { accessToken, refreshToken } = tokenService.signToken(user);
    res.status(200).json({
      message: "user logged in successfully",
      accessToken,
      refreshToken,
    });
  };
}

export default new AuthService();
