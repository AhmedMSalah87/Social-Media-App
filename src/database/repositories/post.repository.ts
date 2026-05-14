import { Model } from "mongoose";
import PostModel, { Post } from "../models/post.model";
import BaseRepository from "./base.repository";

export class PostRepository extends BaseRepository<Post> {
  constructor(model: Model<Post> = PostModel) {
    super(model);
  }
}
