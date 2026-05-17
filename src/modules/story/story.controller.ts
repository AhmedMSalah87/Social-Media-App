import { NextFunction, Request, Response, Router } from "express";
import { authenticate } from "../../middleware/authentication";
import storyService from "./story.service";
import { AppError } from "../../errors/error";
import { validate } from "../../middleware/validation";
import { createStorySchema } from "./story.validation";
import { CreateStoryDTO } from "./story.dto";
import { uploadCloud } from "../../middleware/multer";
import { FileType } from "../../common/enum/user.enum";

const storyRouter = Router();

storyRouter.post(
  "/",
  authenticate,
  uploadCloud(FileType.image, false).single("attachment"),
  validate(createStorySchema),
  async (
    req: Request<{}, {}, CreateStoryDTO>,
    res: Response,
    next: NextFunction,
  ) => {
    const { content, visibility } = req.body;
    const userId = req.user?._id;
    if (!userId) {
      throw new AppError("unauthorized user", 401);
    }
    if (!req.file && !content) {
      throw new AppError("content is required", 400);
    }
    await storyService.createStory(userId, visibility, content, req.file);
    res.status(201).json({ message: "story created successfully" });
  },
);

export default storyRouter;
