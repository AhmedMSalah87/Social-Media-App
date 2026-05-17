import { InferSchemaType, Schema, Types, model, models } from "mongoose";
import { StoryVisibility } from "../../common/enum/story.enum";

const storySchema = new Schema(
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
    visibility: {
      type: String,
      enum: StoryVisibility,
      default: StoryVisibility.friends,
    },
    expiredAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

storySchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

export type Story = InferSchemaType<typeof storySchema>;

const StoryModel = models.Story || model<Story>("Story", storySchema);

export default StoryModel;
