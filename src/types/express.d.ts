import { HydratedDocument } from "mongoose";
import { User } from "../database/models/user.model";

declare module "express-serve-static-core" {
  interface Request {
    user?: HydratedDocument<User>;
  }
}
