import mongoose, { Schema } from "mongoose";

const workspaceMemberSchema = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },

    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

workspaceMemberSchema.index(
  { workspace: 1, user: 1 },
  { unique: true }
);

workspaceMemberSchema.index({
  user: 1,
  status: 1,
});

workspaceMemberSchema.index({
  workspace: 1,
  status: 1,
});

export const WorkspaceMember = mongoose.model(
  "WorkspaceMember",
  workspaceMemberSchema
);