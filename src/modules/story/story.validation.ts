import z from "zod";
import { StoryVisibility } from "../../common/enum/story.enum";

export const createStorySchema = z
  .object({
    body: z.strictObject({
      content: z.string().min(1).optional(),
      visibility: z.enum(StoryVisibility).default(StoryVisibility.friends),
    }),
    file: z.custom<Express.Multer.File>().optional(),
  })
  .superRefine((args, ctx) => {
    if (!args.body.content && !args.file) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "content"],
        message: "content is required",
      });
    }
  });
