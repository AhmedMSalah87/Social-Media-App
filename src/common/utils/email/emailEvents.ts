import { EventEmitter } from "node:events";
import { UserEvents } from "../../enum/user.enum";
import redisService from "../../services/redis.service";
import { generateOTP } from "../generateOTP";
import { hashValue } from "../hash";
import { OTPKeys } from "../otpKeys";
import { sendEmailVerification } from "./sendEmail";

export const eventEmitter = new EventEmitter();

eventEmitter.on(UserEvents.confirmEmail, async (email: string) => {
  const otp = generateOTP();
  const hashedOtp = await hashValue(otp);
  Promise.all([
    redisService.setCache(OTPKeys.otp(email), hashedOtp, 600),
    sendEmailVerification(email, otp),
  ]);
});

eventEmitter.on(UserEvents.forgetPassword, async (email: string) => {
  const otp = generateOTP();
  const hashedOTP = await hashValue(otp);
  Promise.all([
    redisService.setCache(OTPKeys.forgotPassword(email), hashedOTP, 600),
    sendEmailVerification(email, otp),
  ]);
});
