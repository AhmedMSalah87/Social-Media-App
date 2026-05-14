import { NextFunction, Request, Response, Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { AppError } from "../../errors/error";
import postService from "./post.service";
import { CreatPostDTO, getAllPostsDTO } from "./post.dto";
import { uploadCloud } from "../../middleware/multer";
import { FileType } from "../../common/enum/user.enum";
import { validate } from "../../middleware/validation";
import { createPostSchema } from "./post.validation";
import { Types } from "mongoose";
import likeRouter from "../like/like.controller";

const postRouter = Router();

postRouter.use("/:postId/like", likeRouter);

postRouter.post(
  "/",
  authenticate,
  uploadCloud(FileType.image, false).single("attachment"),
  validate(createPostSchema),
  async (
    req: Request<{}, {}, CreatPostDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    const { content, allowComment, availability, tags } = req.body;
    const tagsObjectIds = tags?.map((tag) => new Types.ObjectId(tag));
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError("unauthorized user", 401);
    }
    if (!content && !req.file) {
      throw new AppError("content is required", 400);
    }
    await postService.createPost(
      userId,
      content,
      req.file,
      tagsObjectIds,
      allowComment,
      availability,
    );

    res.status(201).json({ message: "post created successfully" });
  },
);

postRouter.get(
  "/",
  authenticate,
  async (
    req: Request<{}, {}, {}, getAllPostsDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    const { page, limit, sort, order } = req.query;
    const sorting: Record<string, 1 | -1> = {
      [sort]: order === "asc" ? 1 : -1,
    };
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError("unauthorized user", 401);
    }
    const posts = await postService.getPosts(userId, {
      page: pageNumber,
      limit: limitNumber,
      sort: sorting,
    });
    res.status(200).json(posts);
  },
);

export default postRouter;
