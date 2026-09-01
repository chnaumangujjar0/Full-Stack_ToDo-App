import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({
  expiresAt: 1,
}, {
  expireAfterSeconds: 0,
});

sessionSchema.pre("save", async function(){ 

    if(!this.isModified("refreshToken")) return;
    this.refreshToken = await bcrypt.hash(this.refreshToken,10)
})

sessionSchema.methods.isSessionValid = async function (refreshToken) {

    return await bcrypt.compare(refreshToken,this.refreshToken)
}
export const Session = mongoose.model("Session", sessionSchema);