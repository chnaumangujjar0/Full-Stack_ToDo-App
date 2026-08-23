import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Todo } from "../models/todo.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const addTask = asyncHandler(async (req, res) => {
  const { title, description, status = "pending",deadline,workspaceId,assignedTo } = req.body;
  const validStatuses = ["pending", "in-progress", "completed"];
  const query = {}
  if (!(title || description)) {
    throw new ApiError(400, "title and description is required");
  }
  
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Status must be pending, in-progress, or completed");
  }
  
  query.title = title.trim();
  query.description = description.trim();
  query.deadline = deadline;
  query.owner = req.user._id
  query.status = status;
  if(assignedTo != ""){
    query.assignedTo = assignedTo
  }
  if(workspaceId){
    query.workspace = workspaceId
  }
  const todo = await Todo.create(query);

  if (!todo.length == 0) {
    throw new ApiError(401, "todo is not created");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, todo, "todo added successfully"));
});

const getAllTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 5, filter = "all", status = "all",workspaceId ="none" } = req.query;
  let query = {};
  console.log(workspaceId)
  query.workspace = workspaceId
  const now = new Date();
  query.owner = req.user._id
  if (filter === "today") {
    now.setHours(0, 0, 0, 0);
    query.createdAt = { $gte: now };
  }

  if (filter === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    query.createdAt = {
      $gte: yesterday,
      $lt: today,
    };
  }

  if (filter === "week") {
    const week = new Date();
    week.setDate(week.getDate() - week.getDay());
    console.log(week)
    week.setHours(0, 0, 0, 0);

    query.createdAt = {
      $gte: week,
    };
  }

  if (filter === "month") {
    const month = new Date();
    month.setDate(1);
    month.setHours(0, 0, 0, 0);

    query.createdAt = {
      $gte: month,
    };
  }
  if (status === "completed") {
    query.status = "completed";
  } else if (status === "pending") {
    query.status = "pending";
  } else if (status === "in-progress") {
    query.status = "in-progress";
  }

  const pageNum = (parseInt(page) - 1) * limit;
  const limitNum = parseInt(limit);

  const tasks = await Todo.find(query)
    .sort({ createdAt: -1 })
    .skip(pageNum)
    .limit(limitNum)
  
  if (!tasks) {
    throw new ApiError(400, "Task fetching failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "tasks fetcheed successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description,deadline } = req.body;

  if (!isValidObjectId(taskId)) {
    throw new ApiError(400, "invalid object id");
  }

  if (!(title && description)) {
    throw new ApiError(400, "updated things are required");
  }
  const existingTask = await Todo.findById(taskId);

  if (!existingTask) {
    throw new ApiError(400, "this task does not exist");
  }

  const todo = await Todo.findByIdAndUpdate(
    existingTask._id,
    {
      $set: {
        title: title.trim(),
        description: description.trim(),
        deadline
      },
    },
    { returnDocument: "after" },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, todo, "todo updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!isValidObjectId(taskId)) {
    throw new ApiError(400, "invalid object id");
  }

  const existingTask = await Todo.findById(taskId);

  if (!existingTask) {
    throw new ApiError(400, "task is already deleted");
  }
  await Todo.deleteOne({ _id: existingTask._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "task deleted successfully!"));
});

const gettaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  if (!isValidObjectId(taskId)) {
    throw new ApiError(400, "invalid object id");
  }
  const task = await Todo.findById(taskId);

  return res
    .status(200)
    .json(new ApiResponse(200, task, "task fetched successfully"));
});

const toggleStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "in-progress", "completed"];

  if (!isValidObjectId(taskId)) {
    throw new ApiError(400, "invalid object id");
  }

  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(
      400,
      "Status is required and must be one of: pending, in-progress, completed",
    );
  }

  const existingTask = await Todo.findById(taskId);

  if (!existingTask) {
    throw new ApiError(400, "this task does not exist!");
  }

  const task = await Todo.findByIdAndUpdate(
    taskId,
    {
      $set: {
        status,
      },
    },
    { returnDocument: "after" },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task status updated successfully"));
});

const countData = asyncHandler(async (req, res) => {
  const data = await Todo.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
        workspace: "none"
      }
    },
    {
      $group: {
        _id: null,
        totalTasks: {
          $sum: 1,
        },

        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },

        pending: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
          },
        },
        inProgress: {
          $sum: {
            $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalTasks: 1,
        completed: 1,
        pending: 1,
        inProgress: 1
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "data fetched successfully"));
});

const workspaceTasks = asyncHandler(async (req,res) => {
  const {workspaceId} = req.params
  console.log(workspaceId)
  const tasks = await Todo.find({workspace: workspaceId}).populate("assignedTo","username fullName")

  return res.status(200).json(
    new ApiResponse(
      200,
      tasks,
      "Workspace tasks fetched Successfully!"
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
  countData,
  workspaceTasks
};
