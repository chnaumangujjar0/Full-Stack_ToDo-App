import mongoose, { isValidObjectId } from "mongoose";
import { Workspace } from "../models/workspace.model.js";
import { WorkspaceMember } from "../models/workspaceMember.model.js";
import { Todo } from "../models/todo.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  isWorkspaceOwner,
  assertCanManageWorkspace,
  assertIsWorkspaceMember,
} from "../utils/workspaceAccess.utils.js";

export const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Workspace name is required!");
  }

  const newWorkspace = await Workspace.create({
    name: name.trim(),
    owner: req.user._id,
  });

  if(!newWorkspace){
    throw new ApiError(500, "Failed to create workspace, please try again.");
  }
  
    await WorkspaceMember.create({
      workspace: newWorkspace._id,
      user: req.user._id,
      role: "admin",
      status: "active",
    });

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
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace id.");
  }

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  await assertIsWorkspaceMember(workspace, req.user._id);

  const isOwner = isWorkspaceOwner(workspace, req.user._id);

  const members = await WorkspaceMember.aggregate([
    {
      $match: {
        workspace: new mongoose.Types.ObjectId(workspaceId),
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
          $cond: [
            { $eq: ["$user", new mongoose.Types.ObjectId(workspace.owner)] },
            "owner",
            "$role",
          ],
        },
        joinedAt: 1,
        user: "$userDetails",
      },
    },
  ]);

  let currentUserRole = "owner";
  if (!isOwner) {
    const currentUserData = members.find(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    currentUserRole = currentUserData?.role || "member";
  }

  const response = {
    ...workspace.toObject(),
    role: currentUserRole,
    members,
  };


  return res
    .status(200)
    .json(new ApiResponse(200, response, "Workspace details fetched successfully!"));
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { name } = req.body;

  if (!isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace id.");
  }

  if (!name?.trim()) {
    throw new ApiError(400, "Workspace name is required!");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }
  await assertCanManageWorkspace(workspace, req.user._id);

  const updatedWorkspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    { $set: { name: name.trim() } },
    { "returnDocument": "after", runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedWorkspace, "Workspace updated successfully!"));
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid Object Id.");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  if (!isWorkspaceOwner(workspace, req.user._id)) {
    throw new ApiError(403, "Only the workspace owner can delete this workspace.");
  }

  await Workspace.findByIdAndDelete(workspaceId);
  await Todo.deleteMany({ workspace: workspaceId });
  await WorkspaceMember.deleteMany({ workspace: workspaceId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Workspace deleted successfully!"));
});