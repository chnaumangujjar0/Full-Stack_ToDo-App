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
        }
    },
    {timestamps: true}
)

export const Todo = mongoose.model("Todo",todoSchema)