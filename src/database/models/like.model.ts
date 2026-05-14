import { InferSchemaType, Schema, Types, model, models } from "mongoose";

const likeSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    postId: {
      type: Types.ObjectId,
      required: true,
      ref: "Post",
    },
  },
  {
    timestamps: true,
  },
);

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export type Like = InferSchemaType<typeof likeSchema>;

const LikeModel = models.Like || model<Like>("Like", likeSchema);

export default LikeModel;
