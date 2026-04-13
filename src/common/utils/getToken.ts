import { Request } from "express";
import { AppError } from "../../errors/error";

export const getToken = (req: Request) => {
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
