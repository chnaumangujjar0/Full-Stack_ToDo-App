import { Workspace } from "../models/workspace.model.js";
import {Todo} from "../models/todo.model.js"
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Notification } from "../models/notification.model.js";

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

export const deleteMember = asyncHandler( async (req,res) => {
  const {workspaceId} = req.params
  const {memberId} = req.body
  console.log(memberId)
  if(!isValidObjectId(workspaceId) || !isValidObjectId(memberId)){
    throw new ApiError(400,"Invalid Object Id!")
  }

  const updatedWorkspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId, members: memberId }, 
    { $pull: { members: memberId } },        
    { new: true }                            
  );

  if (!updatedWorkspace) {
    throw new ApiError(404, "Workspace not found or member already removed.");
  }
  const newNotification = await Notification.create({
        user: memberId, // The user receiving the alert
        message: `You have been removed from ${updatedWorkspace.name}`,
        type: 'kicked_from_workspace',
        isRead: false
    });

    
  const io = req.app.get("io");
  if (io) {
    io.to(memberId).emit("kicked_from_workspace", {
      workspaceId,
      message: `You have been removed from ${updatedWorkspace.name}`
    });
    io.to(memberId.toString()).emit("new_notification", newNotification);
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Member removed Successfully!"
    )
  )
})