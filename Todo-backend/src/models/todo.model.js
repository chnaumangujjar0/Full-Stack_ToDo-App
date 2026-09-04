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
            type: mongoose.Types.ObjectId,
            ref: "Workspace",
            default: null
        },
        assignedTo: {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true}
)

todoSchema.index({
  workspace: 1,
  status: 1,
});

todoSchema.index({
  workspace: 1,
  assignedTo: 1,
});

todoSchema.index({
  deadline: 1,
});

export const Todo = mongoose.model("Todo",todoSchema)