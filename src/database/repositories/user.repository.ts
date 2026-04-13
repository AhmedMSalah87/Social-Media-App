import { HydratedDocument, Model } from "mongoose";
import UserModel, { User } from "../models/user.model";
import BaseRepository from "./base.repository";

class UserRepository extends BaseRepository<User> {
  //use default parameter for model so that in future i can use mock for testing
  constructor(model: Model<User> = UserModel) {
    super(model);
  }

  async isEmailExist(email: string): Promise<boolean> {
    const user = await this.findOne({ email });
    return !!user;
  }

  async findByEmail(email: string): Promise<HydratedDocument<User> | null> {
    return await this.findOne({ email });
  }
}

export default UserRepository;
