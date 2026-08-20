import mongoose, { Schema } from "mongoose";

const loginActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
  },
  { timestamps: true }
);

export const LoginActivity = mongoose.model("LoginActivity", loginActivitySchema);