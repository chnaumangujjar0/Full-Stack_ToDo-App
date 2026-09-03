import mongoose, { Schema } from "mongoose";

const inviteSchema = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    inviter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invitee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["admin", "member",],
      default: "member",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired", "cancelled"],
      default: "pending",
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

inviteSchema.index({
  workspace: 1,
  email: 1,
  status: 1,
});

export const Invite = mongoose.model("Invite", inviteSchema);