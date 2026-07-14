import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Todo} from "../models/todo.model.js"
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";


const addTask = asyncHandler(async (req, res) =>{
    const {title, description, completed = false} = req.body

    if(!(title || description)){
        throw new ApiError(400, "title and description is required")
    }

    const todo = await Todo.create({
        title: title.trim(),
        description: description.trim(),
        completed
    })

    if(!todo){
        throw new ApiError(401,"todo is not created")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            todo,
            "todo added successfully"
        )
    )
})

const getAllTasks = asyncHandler(async (req,res) => {
    const {page = 1, limit = 5, filter = "all"} = req.query
    let query = {}
 
    if (filter !== "all") {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
 
        if (filter === "today") {
            query.createdAt = { $gte: startOfToday }
        } else if (filter === "yesterday") {
            const startOfYesterday = new Date(startOfToday)
            startOfYesterday.setDate(startOfYesterday.getDate() - 1)
            query.createdAt = { $gte: startOfYesterday, $lt: startOfToday }
        } else if (filter === "week") {
            const startOfWeek = new Date(startOfToday)
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
            query.createdAt = { $gte: startOfWeek }
        } else if (filter === "month") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            query.createdAt = { $gte: startOfMonth }
        }
    }
    const pageNum = (parseInt(page) - 1) * limit
    const limitNum = parseInt(limit)

    const tasks = await Todo.find(query).sort({createdAt: -1}).skip(pageNum).limit(limit)
    if(!tasks){
        throw new ApiError(400, "Task fetching failed")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tasks,
            "tasks fetcheed successfully"
        )
    )
})

const updateTask = asyncHandler(async (req,res) => {
    const {taskId} = req.params
    const {title, description} = req.body

    if(!isValidObjectId(taskId)){
        throw new ApiError(400,"invalid object id")
    }

    if(!(title && description)){
        throw new ApiError(400, "updated things are required")
    }
    const existingTask = await Todo.findById(taskId)

    if(!existingTask){
        throw new ApiError(400,"this task does not exist")
    }

    const todo = await Todo.findByIdAndUpdate(
        existingTask._id,
        {
            $set: {
                title: title.trim(),
                description: description.trim(),
            }
        },
        {"returnDocument" : "after"}
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            todo,
            "todo updated successfully"
        )
    )

})

const deleteTask = asyncHandler(async (req, res) => {
    const {taskId} = req.params

    if(!isValidObjectId(taskId)){
        throw new ApiError(400,"invalid object id")
    }

    const existingTask = await Todo.findById(taskId)

    if(!existingTask){
        throw new ApiError(400,"task is already deleted")
    }

    await Todo.deleteOne({_id: existingTask._id})

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "task deleted successfully!"
        )
    )
})

const gettaskById = asyncHandler(async (req,res) => {
    const {taskId} = req.params

    if(!isValidObjectId(taskId)){
        throw new ApiError(400,"invalid object id")
    }
    const task = await Todo.findById(taskId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            task,
            "task fetched successfully"
        )
    )


})

const toggleStatus = asyncHandler(async (req,res) => {
    const {taskId} = req.params

    if(!isValidObjectId(taskId)){
        throw new ApiError(400,"invalid object id")
    }
    const existingTask = await Todo.findById(taskId)

    if(!existingTask){
        throw new ApiError(400,"this atsk does not exist!")
    }
    const task = await Todo.findByIdAndUpdate(
        taskId,
        {
            $set: {
                completed: !existingTask.completed
            }
        },
        {"returnDocument" : "after"}
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            task,
            "Task toogled successfully"
        )
    )
})

const countData = asyncHandler(async (req,res) => {
    const data = await Todo.aggregate([
        {
            $group: {
                _id: null,
                totalTasks: {
                    $sum: 1
                },

                completed: {
                    $sum: {
                        $cond: ["$completed", 1, 0]
                    }
                },

                inCompleted: {
                    $sum: {
                        $cond: ["$completed", 0, 1]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalTasks: 1,
                completed: 1,
                inCompleted: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "data fetched successfully"
        )
    )
})

export {
    addTask,
    getAllTasks,
    updateTask,
    deleteTask,
    gettaskById,
    toggleStatus,
    countData
}