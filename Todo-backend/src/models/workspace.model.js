import mongoose, { Schema } from "mongoose";

const workspaceSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      minlength: [3, "Workspace name must be at least 3 characters"],
      maxlength: [50, "Workspace name cannot exceed 50 characters"],
    },
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);