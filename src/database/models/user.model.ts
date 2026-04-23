import { InferSchemaType, Schema, model, models } from "mongoose";
import { Gender, Provider, Role } from "../../common/enum/user.enum";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === Provider.credentials;
      },
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: function () {
        return this.provided === Provider.credentials;
      },
    },
    provider: {
      type: String,
      enum: Object.values(Provider),
      default: Provider.credentials,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.user,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      required: function () {
        this.provider === Provider.google;
      },
    },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

const UserModel = models.User || model<User>("User", userSchema);

export default UserModel;
