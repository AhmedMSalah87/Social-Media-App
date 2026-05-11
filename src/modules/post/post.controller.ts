import { NextFunction, Request, Response, Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { AppError } from "../../errors/error";
import postService from "./post.service";

const postRouter = Router();

postRouter.post(
  "/",
  authenticate,
  async (
    req: Request<{}, {}, { content: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { content } = req.body;
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError("unauthorized user", 401);
    }
    await postService.createPost(userId, content);
    res.status(201).json({ message: "post created successfully" });
  },
);

postRouter.get(
  "/",
  authenticate,
  async (
    req: Request<
      {},
      {},
      {},
      { page: string; limit: string; sort: string; order: "asc" | "desc" }
    >,
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
