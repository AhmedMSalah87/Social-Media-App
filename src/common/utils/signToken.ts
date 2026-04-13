import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { UserDoc } from "../../database/models/user.model";
import { Types } from "mongoose";

const tokenId = randomUUID();

export const signToken = (user: UserDoc) => {
  const ACCESS_SECRET_KEY: Secret = process.env.ACCESS_SECRET_KEY!;
  const REFRESH_SECRET_KEY: Secret = process.env.REFRESH_SECRET_KEY!;
  const accessOptions: SignOptions = { expiresIn: "15m", jwtid: tokenId };
  const refreshOptions: SignOptions = { expiresIn: "30d", jwtid: tokenId };

  const accessToken = jwt.sign(
    { id: user._id },
    ACCESS_SECRET_KEY,
    accessOptions,
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    REFRESH_SECRET_KEY,
    refreshOptions,
  );

  return { accessToken, refreshToken };
};
