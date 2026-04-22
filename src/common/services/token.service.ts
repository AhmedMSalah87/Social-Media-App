import { Request } from "express";
import { AppError } from "../../errors/error";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import { randomUUID } from "node:crypto";
import { HydratedDocument } from "mongoose";
import { User } from "../../database/models/user.model";

// type AuthPayload = JwtPayload & {
//   id: Types.ObjectId;
// };

class TokenService {
  constructor() {}

  getToken = (req: Request) => {
    const auth = req.headers.authorization;
    if (!auth) {
      throw new AppError("no authentication header provided in request", 401);
    }
    const [prefix, token] = auth.split(" ");
    if (prefix !== "Bearer") {
      throw new AppError(
        "Invalid authorization header format. Bearer token required",
        401,
      );
    }
    return token;
  };

  verifyToken = (token: string) => {
    const ACCESS_SECRET_KEY: Secret = process.env.ACCESS_SECRET_KEY!;
    const decoded = jwt.verify(token, ACCESS_SECRET_KEY);
    if (typeof decoded === "string") {
      throw new Error("Invalid token");
    }
    return decoded as JwtPayload;
  };

  signToken = (user: HydratedDocument<User>) => {
    const tokenId = randomUUID();
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
}

export default new TokenService();
