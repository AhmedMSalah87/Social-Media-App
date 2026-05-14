import { NextFunction, Request, Response, Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { AppError } from "../../errors/error";
import likeService from "./like.service";
import { Types } from "mongoose";

const likeRouter = Router({ mergeParams: true });

likeRouter.post(
  "/",
  authenticate,
  async (
    req: Request<{ postId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user?._id;
    const { postId } = req.params;
    if (!userId) {
      throw new AppError("unauthorized user", 401);
    }
    const postObjectId = new Types.ObjectId(postId);
    const result = await likeService.likePost(userId, postObjectId);
    res.status(result.like ? 201 : 200).json({
      message: result.like ? "like added to post" : "dislike to post",
    });
  },
);

export default likeRouter;
