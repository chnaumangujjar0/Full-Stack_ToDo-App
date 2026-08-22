import mongoose,{Schema} from "mongoose";

const todoSchema = new Schema(
    {
        title: {
            type: String,
            required:  true,
        },
        description: {
            type: String,
            required:  true,
        },
        status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending"
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        },
        deadline: {
            type: Date
        },
        reminderSent: {
            type: Boolean,
            default: false
        },
        workspace: {
            type: String,
            default: "none"
        },
        assignedTo: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
)

export const Todo = mongoose.model("Todo",todoSchema)