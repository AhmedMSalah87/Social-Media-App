import z from "zod";
import { createPostSchema } from "./post.validation";
export type getAllPostsDTO = {
  page: string;
  limit: string;
  sort: string;
  order: "asc" | "desc";
};

export type CreatPostDTO = z.infer<typeof createPostSchema.shape.body>;
