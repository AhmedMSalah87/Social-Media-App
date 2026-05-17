import { StoryRepository } from "../../database/repositories/story.repository";

class StoryService {
  private readonly storyRepo: StoryRepository = new StoryRepository();
  constructor() {}

  createStory = async () => {};
}

export default new StoryService();
