import mongoose,{Schema} from "mongoose";
const workspaceSchema = new Schema({
    owner:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    members: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    ],
})

export const Workspace = mongoose.model("Workspace",workspaceSchema)