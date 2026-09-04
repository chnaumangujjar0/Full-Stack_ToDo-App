import mongoose from "mongoose";
import { Workspace } from "../models/workspace.model.js";
import { WorkspaceMember } from "../models/workspaceMember.model.js";
import { Todo } from "../models/todo.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

// --- CREATE WORKSPACE --- (no :workspaceId yet, so no RBAC middleware applies)
export const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Workspace name is required!");
  }

  const newWorkspace = await Workspace.create({
    name: name.trim(),
    owner: req.user._id,
  });

  try {
    await WorkspaceMember.create({
      workspace: newWorkspace._id,
      user: req.user._id,
      role: "admin",
      status: "active",
    });
  } catch (error) {
    await Workspace.findByIdAndDelete(newWorkspace._id);
    throw new ApiError(500, "Failed to create workspace, please try again.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newWorkspace, "Workspace created successfully!"));
});

export const getAllWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await WorkspaceMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
        status: "active",
      },
    },
    {
      $lookup: {
        from: "workspaces",
        localField: "workspace",
        foreignField: "_id",
        as: "workspace",
      },
    },
    { $unwind: "$workspace" },
    {
      $project: {
        _id: "$workspace._id",
        name: "$workspace.name",
        owner: "$workspace.owner",
        role: {
          $cond: [{ $eq: ["$workspace.owner", "$user"] }, "owner", "$role"],
        },
        joinedAt: "$joinedAt",
        createdAt: "$workspace.createdAt",
        updatedAt: "$workspace.updatedAt",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, workspaces, "Fetched all workspaces successfully!"));
});

export const getWorkspaceById = asyncHandler(async (req, res) => {
  const { workspace, workspaceRole } = req;

  const members = await WorkspaceMember.aggregate([
    {
      $match: {
        workspace: workspace._id,
        status: "active",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
        pipeline: [{ $project: { username: 1, avatar: 1, fullName: 1 } }],
      },
    },
    { $unwind: "$userDetails" },
    {
      $project: {
        _id: 0,
        role: {
          $cond: [{ $eq: ["$user", workspace.owner] }, "owner", "$role"],
        },
        joinedAt: 1,
        user: "$userDetails",
      },
    },
  ]);

  const response = {
    ...workspace.toObject(),
    role: workspaceRole,
    members,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Workspace details fetched successfully!"));
});

// --- UPDATE WORKSPACE --- (route uses requireWorkspaceManager: owner or admin)
export const updateWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Workspace name is required!");
  }

  const updatedWorkspace = await Workspace.findByIdAndUpdate(
    req.workspace._id,
    { $set: { name: name.trim() } },
    { "returnDocument": "after", runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedWorkspace, "Workspace updated successfully!"));
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const { workspace } = req;

  await Workspace.findByIdAndDelete(workspace._id);
  await Todo.deleteMany({ workspace: workspace._id });
  await WorkspaceMember.deleteMany({ workspace: workspace._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Workspace deleted successfully!"));
});