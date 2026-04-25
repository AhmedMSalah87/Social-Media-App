import { Request, Response, NextFunction } from "express";
import { CreateUserDTO, SignInDTO, VerifyEmailDTO } from "./auth.dto";
import { AppError } from "../../errors/error";
import { compareValue, hashValue } from "../../common/utils/hash";
import UserRepository from "../../database/repositories/user.repository";
import { eventEmitter } from "../../common/utils/email/emailEvents";
import { Provider, UserEvents } from "../../common/enum/user.enum";
import redisService from "../../common/services/redis.service";
import { OTPKeys } from "../../common/utils/otpKeys";
import TokenService from "../../common/services/token.service";
import GoogleService from "../../common/services/google.service";

class AuthService {
  private readonly userRepo: UserRepository = new UserRepository();
  private readonly redisRepo = redisService;
  private readonly googleService = new GoogleService();
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
    if (!user || !user.password) {
      throw new AppError("user not found", 404);
    }
    const isMatched = await compareValue(password, user.password);
    if (!isMatched) {
      throw new AppError("invalid password", 400);
    }
    const { accessToken, refreshToken } = TokenService.signToken(user);
    res.status(200).json({
      message: "user logged in successfully",
      accessToken,
      refreshToken,
    });
  };

  signWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
    const { idToken }: { idToken: string } = req.body;
    if (!idToken) {
      throw new AppError("no token provided", 400);
    }
    const payload = await this.googleService.verify(idToken);
    const { email, email_verified, given_name, family_name, sub } = payload;
    if (!email || !email_verified) {
      throw new AppError("invalid google account", 400);
    }
    // to fix undefined error from typescript
    const firstName = given_name ?? "";
    const lastName = family_name ?? "";
    let isNewUser = false;

    let user = await this.userRepo.findByEmail(email);
    if (user && user.provider == Provider.credentials) {
      throw new AppError(
        "email already exists. please login with credentials",
        409,
      );
    }
    if (!user) {
      user = await this.userRepo.create({
        firstName,
        lastName,
        email,
        provider: Provider.google,
        googleId: sub,
        isVerified: email_verified,
      });
      isNewUser = true;
    }

    const { accessToken, refreshToken } = TokenService.signToken(user);

    res.status(isNewUser ? 201 : 200).json({
      message: isNewUser
        ? "user registered successfully"
        : "user logged in successfully",
      accessToken,
      refreshToken,
    });
  };

  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const existingUser = await this.userRepo.findOne({
      email,
      isVerified: true,
      provider: Provider.credentials,
    });

    if (!existingUser) {
      throw new AppError("user not found", 404);
    }

    eventEmitter.emit(UserEvents.forgetPassword, email);

    res.status(200).json({ message: "otp send for password reset" });
  };

  verifyForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { email, otp }: VerifyEmailDTO = req.body;
    const hashedOTP = await redisService.getCache(
      OTPKeys.forgotPassword(email),
    );

    if (!hashedOTP) {
      throw new AppError("OTP has expired", 404);
    }

    const isMatched = await compareValue(otp, hashedOTP);

    if (!isMatched) {
      throw new AppError("Invalid OTP", 400);
    }

    res.status(200).json({
      message:
        "email otp verified successfully. you are redirected to enter new password",
    });
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, newPassword } = req.body;

    const user = await this.userRepo.findOneAndUpdate(
      {
        email,
        isVerified: true,
        provider: Provider.credentials,
      },
      { password: await hashValue(newPassword) },
    );
    if (!user) {
      throw new AppError("user not found", 404);
    }

    await redisService.deleteCache(OTPKeys.forgotPassword(email));

    res.status(200).json({ message: "password has reset successfully" });
  };

  resendOTP = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await this.userRepo.findOne({
      email,
      isVerified: false,
      provider: Provider.credentials,
    });
    if (!user) {
      throw new AppError("user not found", 404);
    }
    const isBlocked = await this.redisRepo.getCache(OTPKeys.block(email));
    if (isBlocked) {
      throw new AppError(
        "you are blocked. Please wait for 30 minutes to resend new OTP",
        401,
      );
    }
    const cooldownTTL = await this.redisRepo.cacheTTL(OTPKeys.cooldown(email));
    if (cooldownTTL > 0) {
      throw new AppError(`Resend after ${cooldownTTL} seconds`, 401);
    }
    const attempts = await this.redisRepo.increment(
      OTPKeys.resendAttempts(email),
    );
    if (attempts > 5) {
      Promise.all([
        this.redisRepo.setCache(OTPKeys.block(email), 1, 1800),
        this.redisRepo.deleteCache(
          OTPKeys.resendAttempts(email),
          OTPKeys.cooldown(email),
        ),
      ]);

      throw new AppError(
        "you exceeded 5 attempts of sending OTP. Please wait for 30 minutes to resend new OTP",
        401,
      );
    }
    eventEmitter.emit(UserEvents.resendOTP, email);
    res.status(200).json({ message: "otp send to your email" });
  };
}

export default new AuthService();
