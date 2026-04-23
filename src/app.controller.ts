import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import authRouter from "./modules/auth/auth.controller";
import { AppError } from "./errors/error";
import { connectDB } from "./database/connection";
import redisService from "./common/services/redis.service";
import userRouter from "./modules/user/user.controller";

const app: Application = express();

const bootstrap = async () => {
  app.use(express.json());

  await connectDB();
  await redisService.connect();

  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "welcome to social app" });
  });

  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("{/*demo}", (req: Request, res: Response, next: NextFunction) => {
    throw new Error(`url with ${req.originalUrl} and ${req.method} not found`, {
      cause: 404,
    });
  });

  app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({
      name: err.name,
      message: err.message,
      status: err.status,
      details: err.details,
    });
  });

  app.listen(5000, () => {
    console.log("server is running");
  });
};
export default bootstrap;
