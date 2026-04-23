export class OTPKeys {
  static otpPrefix: string = "otp";
  static otp = (email: string) => `${this.otpPrefix}:${email}`;
  static cooldown = (email: string) => `${this.otpPrefix}:${email}:cooldown`;
  static resendAttempts = (email: string) =>
    `${this.otpPrefix}:${email}:resend_attempts`;
  static verifyAttempts = (email: string) =>
    `${this.otpPrefix}:${email}:verify_attempts`;
  static block = (email: string) => `${this.otpPrefix}:${email}:blocked`;
  static forgotPassword = (email: string) =>
    `${this.otpPrefix}:${email}:forgetPassword`;
}
