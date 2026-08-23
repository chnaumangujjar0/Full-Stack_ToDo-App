import { Workspace } from "../models/workspace.model.js";
import {Todo} from "../models/todo.model.js"
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

// --- 1. CREATE WORKSPACE ---
export const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name.trim()) {
    throw new ApiError(400, "Workspace name is required!");
  }

  const newWorkspace = await Workspace.create({
    name,
    owner: req.user._id,
    members: [req.user._id],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, newWorkspace, "Workspace created successfully!"),
    );
});

export const getAllWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.aggregate([
    {
      $match: {
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      },
    },
    {
      $addFields: {
        role: {
          $cond: [{ $eq: ["$owner", req.user._id] }, "owner", "member"],
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, workspaces, "Fetch all workspaces Successfully!"),
    );
});

export const getWorkspaceById = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace id.");
  }
  const response = await Workspace.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(workspaceId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "memberDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        role: {
          $cond: [
            { $eq: ["$owner", new mongoose.Types.ObjectId(req.user._id)] },
            "owner",
            "member",
          ],
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        response,
        "Workspace details fetchedd successfully!",
      ),
    );
});

export const deleteWorkspace = asyncHandler(async (req,res) => {
  const {workspaceId} = req.params

  if(!isValidObjectId(workspaceId)){
    throw new ApiError(400,"Invalid Object Id.")
  }

  await Workspace.findByIdAndDelete(workspaceId)
  await Todo.deleteMany({workspace: workspaceId})

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Workspace delted successfully!"
    )
  )

})

export const updateWorkspace = asyncHandler(async (req,res) => {
  const {workspaceId} = req.params
  const {name} = req.body

  const workspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    {
      $set:{name : name.trim()}
    },
    {"returnDocument": "after"}
  )

  return res.status(200).json(
    new ApiResponse(
      200,
      workspace,
      "Update workspace Successfully!"
    )
  )
})