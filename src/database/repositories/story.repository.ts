import { Model } from "mongoose";
import StoryModel, { Story } from "../models/story.model";
import BaseRepository from "./base.repository";

export class StoryRepository extends BaseRepository<Story> {
  constructor(model: Model<Story> = StoryModel) {
    super(model);
  }
}
