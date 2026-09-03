import mongoose, { Schema } from "mongoose";

const loginActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    deviceInfo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    authProvider: {
      type: String,
      enum: ["local", "auth0"],
      default: null,
    }
  },
  { timestamps: true }
);

loginActivitySchema.index({
  user: 1,
  createdAt: -1,
});
export const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);