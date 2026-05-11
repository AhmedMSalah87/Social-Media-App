import { HydratedDocument, Types } from "mongoose";
import { PostRepository } from "../../database/repositories/post.repository";
import UserRepository from "../../database/repositories/user.repository";
import { AppError } from "../../errors/error";
import { Post } from "../../database/models/post.model";

class PostService {
  private readonly postRepo: PostRepository = new PostRepository();
  private readonly userRepo: UserRepository = new UserRepository();
  constructor() {}

  createPost = async (userId: Types.ObjectId, content: string) => {
    const user = await this.userRepo.findById(userId);
    if (user?.isBlocked) {
      throw new AppError("user is blocked and cant create posts", 401);
    }
    await this.postRepo.create({ authorId: userId, content });
  };

  getPosts = async (
    userId: Types.ObjectId,
    pagination: {
      page: number;
      limit: number;
      sort?: Record<string, 1 | -1>;
    },
  ): Promise<HydratedDocument<Post>[]> => {
    const posts = await this.postRepo.find(
      { authorId: userId },
      {},
      {},
      {
        page: pagination?.page,
        limit: pagination?.limit,
        sort: pagination.sort ?? { createdAt: -1 },
      },
    );
    return posts;
  };
}

export default new PostService();
