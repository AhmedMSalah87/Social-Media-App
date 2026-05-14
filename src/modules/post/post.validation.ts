import z from "zod";
import { generalRules } from "../../common/utils/generalValidationRules";
import { AllowComment, PostAvailability } from "../../common/enum/post.enum";

export const createPostSchema = z
  .object({
    body: z.strictObject({
      content: z.string().min(1).optional(),
      tags: z.array(generalRules.id).optional(),
      allowComment: z.enum(AllowComment).default(AllowComment.allow),
      availability: z.enum(PostAvailability).default(PostAvailability.public),
    }),
    files: z.array(z.custom<Express.Multer.File>()).optional(),
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

    if (args.body.tags) {
      const uniqueTags = new Set(args.body.tags);
      if (args.body.tags.length !== uniqueTags.size) {
        ctx.addIssue({
          code: "custom",
          path: ["body", "tags"],
          message: "duplicate tag",
        });
      }
    }
  });
