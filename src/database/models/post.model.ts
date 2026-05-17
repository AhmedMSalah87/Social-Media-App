import { InferSchemaType, Schema, Types, model, models } from "mongoose";
import { AllowComment, PostAvailability } from "../../common/enum/post.enum";

const postSchema = new Schema(
  {
    authorId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: function (this) {
        return !this.mediaFiles;
      },
      minLength: 1,
      maxLength: 5000,
    },
    mediaFiles: [String],
    tags: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    allowComment: {
      type: String,
      enum: AllowComment,
      default: AllowComment.allow,
    },
    availability: {
      type: String,
      enum: PostAvailability,
      default: PostAvailability.public,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export type Post = InferSchemaType<typeof postSchema>;

const PostModel = models.Post || model<Post>("Post", postSchema);

export default PostModel;
