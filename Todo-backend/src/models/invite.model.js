import mongoose, { Schema } from "mongoose";

const inviteSchema = new Schema(
  {
    workspace: {
      type: mongoose.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    inviter: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true, // The Team Lead sending the invite
    },
    invitee: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true, // The person receiving the invite
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Invite = mongoose.model("Invite", inviteSchema);