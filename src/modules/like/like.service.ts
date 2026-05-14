import { Types } from "mongoose";
import { PostRepository } from "../../database/repositories/post.repository";
import LikeRepository from "../../database/repositories/like.repository";

class LikeService {
  private readonly postRepo: PostRepository = new PostRepository();
  private readonly likeRepo: LikeRepository = new LikeRepository();
  constructor() {}

  likePost = async (userId: Types.ObjectId, postId: Types.ObjectId) => {
    const existLike = await this.likeRepo.findOneAndDelete({ postId, userId });
    if (existLike) {
      await this.postRepo.updateOne(
        { _id: postId },
        { $inc: { likesCount: -1 } },
      );
      return { like: false };
    }
    await this.likeRepo.create({ postId, userId });
    await this.postRepo.updateOne({ _id: postId }, { $inc: { likesCount: 1 } });
    return { like: true };
  };
}

export default new LikeService();
