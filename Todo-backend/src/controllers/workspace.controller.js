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
} from "../utils/workspaceaccess.utils.js";


export const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Workspace name is required!");
  }

  const newWorkspace = await Workspace.create({
    name: name.trim(),
    owner: req.user._id,
  });

    await WorkspaceMember.create({
      workspace: newWorkspace._id,
      user: req.user._id,
      role: "owner",
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
        role: "$role",
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

  const membership = isWorkspaceOwner(workspace, req.user._id)
    ? null
    : await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: req.user._id,
        status: "active",
      });

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
        role: 1,
        joinedAt: 1,
        user: "$userDetails",
      },
    },
  ]);

  const response = {
    ...workspace.toObject(),
    role: isWorkspaceOwner(workspace, req.user._id) ? "owner" : membership.role,
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
  // BUG FIX: guard against a missing/blank name before calling .trim().
  if (!name?.trim()) {
    throw new ApiError(400, "Workspace name is required!");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  // BUG FIX: no permission check existed here previously - any
  // authenticated user could rename any workspace by ID.
  await assertCanManageWorkspace(workspace, req.user._id);

  // BUG FIX: `{"returnDocument": "after"}` is a MongoDB-driver option name,
  // not the documented Mongoose one (`new: true`). Also added
  // `runValidators: true` so the schema's minlength/maxlength on `name`
  // actually gets enforced on update (findByIdAndUpdate skips validators
  // by default).
  const updatedWorkspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    { $set: { name: name.trim() } },
    { new: true, runValidators: true }
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