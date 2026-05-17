import { HydratedDocument, Types } from "mongoose";
import { PostRepository } from "../../database/repositories/post.repository";
import UserRepository from "../../database/repositories/user.repository";
import { AppError } from "../../errors/error";
import { Post } from "../../database/models/post.model";
import { AllowComment, PostAvailability } from "../../common/enum/post.enum";
import s3Service from "../../common/services/amazons3.service";
import fileService from "../file/file.service";

class PostService {
  private readonly postRepo: PostRepository = new PostRepository();
  private readonly userRepo: UserRepository = new UserRepository();
  private readonly fileServ = fileService;
  private readonly s3Serv = s3Service;
  constructor() {}

  createPost = async (
    userId: Types.ObjectId,
    allowComment: AllowComment, //parameter for enum value must be type of enum not string
    availability: PostAvailability,
    content?: string,
    file?: Express.Multer.File,
    tags?: Types.ObjectId[],
  ) => {
    const user = await this.userRepo.findById(userId);
    if (user?.isBlocked) {
      throw new AppError("user is blocked and cant create posts", 403);
    }
    const mentionTags: Types.ObjectId[] = [];
    if (tags?.length) {
      const users = await this.userRepo.find({ _id: { $in: tags } });
      if (tags.length !== users.length) {
        throw new AppError("taged user not exist", 404);
      }
      for (const user of users) {
        mentionTags.push(user._id);
      }
    }
    const keys: string[] = [];
    if (file) {
      const fileKey = await this.fileServ.upload(userId, file);
      keys.push(fileKey);
    }
    const post = await this.postRepo.create({
      authorId: userId,
      content: content ?? "",
      mediaFiles: file ? keys : [],
      allowComment: allowComment,
      availability: availability,
      tags: mentionTags ?? [],
    });

    if (!post) {
      await this.s3Serv.deleteFilesFromS3(keys); // need to change to file service in future
      throw new AppError("failed to create post", 500);
    }
    return post;
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
