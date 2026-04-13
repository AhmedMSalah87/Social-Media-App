import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { Types } from "mongoose";

type AuthPayload = JwtPayload & {
  id: Types.ObjectId;
};

export const verifyToken = (token: string) => {
  const ACCESS_SECRET_KEY: Secret = process.env.ACCESS_SECRET_KEY!;
  const decoded = jwt.verify(token, ACCESS_SECRET_KEY);
  if (typeof decoded === "string") {
    throw new Error("Invalid token");
  }
  return decoded as AuthPayload;
};
