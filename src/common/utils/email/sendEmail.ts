import {
  createTransport,
  SendMailOptions,
  SentMessageInfo,
  Transporter,
} from "nodemailer";
import { emailTemplate } from "./emailTemplate";

const transporter: Transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (mailOptions: SendMailOptions): Promise<void> => {
  try {
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log("message sent: ", info.messageId);
  } catch (err) {
    console.log("Email sending failed: ", err);
    throw err;
  }
};

export const sendEmailVerification = async (
  email: string,
  otp: string,
): Promise<void> => {
  await sendEmail({
    from: `"Design Co." <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Email Verification OTP",
    html: emailTemplate(otp),
  });
};
