import { InferSchemaType, Schema, Types, model, models } from "mongoose";

const fileSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  fileId: {
    type: String,
    required: true,
    unique: true,
  },
  s3Key: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
});

export type File = InferSchemaType<typeof fileSchema>;
const fileModel = models.File || model<File>("File", fileSchema);
export default fileModel;
