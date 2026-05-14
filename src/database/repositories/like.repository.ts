import { HydratedDocument, Model } from "mongoose";
import LikeModel, { Like } from "../models/like.model";
import BaseRepository from "./base.repository";

class LikeRepository extends BaseRepository<Like> {
  constructor(model: Model<Like> = LikeModel) {
    super(model);
  }
}

export default LikeRepository;
