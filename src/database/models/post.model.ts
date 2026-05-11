import mongoose, {
  InferSchemaType,
  Schema,
  Types,
  model,
  models,
} from "mongoose";

const postSchema = new Schema(
  {
    authorId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 5000,
    },
  },
  {
    timestamps: true,
  },
);

export type Post = InferSchemaType<typeof postSchema>;

const PostModel = models.Post || model<Post>("Post", postSchema);

export default PostModel;
