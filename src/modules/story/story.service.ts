import { Types } from "mongoose";
import { StoryRepository } from "../../database/repositories/story.repository";
import { StoryVisibility } from "../../common/enum/story.enum";
import fileService from "../file/file.service";

class StoryService {
  private readonly storyRepo: StoryRepository = new StoryRepository();
  private readonly fileServ = fileService;
  constructor() {}

  createStory = async (
    userId: Types.ObjectId,
    visibility: StoryVisibility,
    content?: string,
    mediaFile?: Express.Multer.File,
    ttl: number = 24,
  ) => {
    const keys: string[] = [];
    if (mediaFile) {
      const key = await this.fileServ.upload(userId, mediaFile);
      keys.push(key);
    }
    const story = await this.storyRepo.create({
      authorId: userId,
      content: content ?? "",
      visibility,
      mediaFiles: keys,
      expiredAt: new Date(Date.now() + ttl * 60 * 60 * 1000),
    });
  };
}

export default new StoryService();
