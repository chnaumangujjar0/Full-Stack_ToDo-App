import mongoose, { isValidObjectId } from "mongoose";
import { Workspace } from "../models/workspace.model.js";
import { WorkspaceMember } from "../models/workspaceMember.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  isWorkspaceOwner,
  assertCanManageWorkspace,
  assertIsWorkspaceMember,
} from "../utils/workspaceAccess.utils.js";

// --- ADD MEMBER ---
export const addMember = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { memberId, role } = req.body;

  if (!isValidObjectId(workspaceId) || !isValidObjectId(memberId)) {
    throw new ApiError(400, "Invalid Object Id!");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  await assertCanManageWorkspace(workspace, req.user._id);

  if (isWorkspaceOwner(workspace, memberId)) {
    throw new ApiError(400, "The workspace owner is already a member.");
  }

  const memberRole = role === "admin" ? "admin" : "member";

  const existing = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: memberId,
  });

  let membership;
  if (existing) {
    if (existing.status === "active") {
      throw new ApiError(409, "This user is already a member of the workspace.");
    }
    existing.status = "active";
    existing.role = memberRole;
    existing.joinedAt = new Date();
    membership = await existing.save();
  } else {
    membership = await WorkspaceMember.create({
      workspace: workspaceId,
      user: memberId,
      role: memberRole,
    });
  }

  const newNotification = await Notification.create({
    user: memberId,
    message: `You have been added to ${workspace.name}`,
    type: "added_to_workspace",
    isRead: false,
  });

  const io = req.app.get("io");
  if (io) {
    const room = memberId.toString();
    io.to(room).emit("added_to_workspace", {
      workspaceId,
      message: `You have been added to ${workspace.name}`,
    });
    io.to(room).emit("new_notification", newNotification);
    const invitedUser = await User.findById(memberId).select(
      "username avatar fullName"
    );
    io.to(workspaceId).emit("invite_response", {
      _id: memberId,
      username: invitedUser?.username,
      avatar: invitedUser?.avatar,
      fullName: invitedUser?.fullName,
      role: memberRole,
      joinedAt: membership.joinedAt,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, membership, "Member added successfully!"));
});

// --- LIST MEMBERS ---
export const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace id.");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  await assertIsWorkspaceMember(workspace, req.user._id);

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
        _id: 1,
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

  return res
    .status(200)
    .json(new ApiResponse(200, members, "Members fetched successfully!"));
});

// --- UPDATE MEMBER ROLE ---
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { memberId, role } = req.body;

  if (!isValidObjectId(workspaceId) || !isValidObjectId(memberId)) {
    throw new ApiError(400, "Invalid Object Id!");
  }
  if (!["admin", "member"].includes(role)) {
    throw new ApiError(400, "Role must be 'admin' or 'member'.");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  if (!isWorkspaceOwner(workspace, req.user._id)) {
    throw new ApiError(403, "Only the workspace owner can change member roles.");
  }

  const membership = await WorkspaceMember.findOneAndUpdate(
    { workspace: workspaceId, user: memberId, status: "active" },
    { $set: { role } },
    { "returnDocument": "after", runValidators: true }
  );

  if (!membership) {
    throw new ApiError(404, "Active membership not found for this user.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, membership, "Member role updated successfully!"));
});

// --- REMOVE MEMBER (kick) ---
export const removeMember = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { memberId } = req.body;

  if (!isValidObjectId(workspaceId) || !isValidObjectId(memberId)) {
    throw new ApiError(400, "Invalid Object Id!");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  await assertCanManageWorkspace(workspace, req.user._id);

  if (isWorkspaceOwner(workspace, memberId)) {
    throw new ApiError(400, "The workspace owner cannot be removed.");
  }

  const updatedMembership = await WorkspaceMember.findOneAndUpdate(
    { workspace: workspaceId, user: memberId, status: "active" },
    { $set: { status: "removed" } },
    { new: true }
  );

  if (!updatedMembership) {
    throw new ApiError(404, "Workspace member not found or already removed.");
  }

  const newNotification = await Notification.create({
    user: memberId,
    message: `You have been removed from ${workspace.name}`,
    type: "kicked_from_workspace",
    isRead: false,
  });

  const io = req.app.get("io");
  if (io) {
    const room = memberId.toString();
    io.to(room).emit("kicked_from_workspace", {
      workspaceId,
      message: `You have been removed from ${workspace.name}`,
    });
    io.to(room).emit("new_notification", newNotification);
    io.to(workspaceId).emit("member_removed", { memberId: room });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member removed successfully!"));
});

// --- LEAVE WORKSPACE (self-service) ---
export const leaveWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace id.");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  if (isWorkspaceOwner(workspace, req.user._id)) {
    throw new ApiError(
      400,
      "The workspace owner cannot leave. Transfer ownership or delete the workspace instead."
    );
  }

  const updatedMembership = await WorkspaceMember.findOneAndUpdate(
    { workspace: workspaceId, user: req.user._id, status: "active" },
    { $set: { status: "removed" } },
    { new: true }
  );

  if (!updatedMembership) {
    throw new ApiError(404, "You are not an active member of this workspace.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "You have left the workspace."));
});