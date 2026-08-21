import mongoose,{Schema} from "mongoose";

const notificationSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "reminder"
    }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);