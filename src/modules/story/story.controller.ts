import { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import storyService from "./story.service";

const storyRouter = Router();

storyRouter.post("/", authenticate, storyService.createStory);

export default storyRouter;
