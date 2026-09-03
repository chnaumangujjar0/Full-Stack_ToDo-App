import { isValidObjectId } from "mongoose";
import { Workspace } from "../models/workspace.model.js";
import { WorkspaceMember } from "../models/workspaceMember.model.js";
import { Invite } from "../models/invite.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  assertCanManageWorkspace,
  isWorkspaceOwner,
} from "../utils/workspaceAccess.utils.js";

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// --- SEND INVITE ---
export const sendInvite = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { username, role } = req.body;

  if (!isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace id.");
  }
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required.");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  await assertCanManageWorkspace(workspace, req.user._id);

  const invitee = await User.findOne({ username: username.trim() });
  if (!invitee) {
    throw new ApiError(404, "Invitee not found");
  }

  if (invitee._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You can't invite yourself.");
  }

  if (isWorkspaceOwner(workspace, invitee._id)) {
    throw new ApiError(400, "This user already owns the workspace.");
  }

  const inviteRole = role === "admin" ? "admin" : "member";

  const alreadyMember = await WorkspaceMember.findOne({
    workspace: workspace._id,
    user: invitee._id,
    status: "active",
  });
  if (alreadyMember) {
    throw new ApiError(400, "User is already in this workspace");
  }

  const existingInvite = await Invite.findOne({
    workspace: workspace._id,
    email: invitee.email,
    status: "pending",
  });
  if (existingInvite) {
    throw new ApiError(400, "Invite already sent.");
  }

  const invite = await Invite.create({
    workspace: workspace._id,
    inviter: req.user._id,
    invitee: invitee._id,
    email: invitee.email,
    role: inviteRole,
    expiresAt: new Date(Date.now() + INVITE_EXPIRY_MS),
  });

  const newNotification = await Notification.create({
    user: invitee._id,
    message: `${req.user.username || "Someone"} invited you to join the workspace: "${workspace.name}"`,
    type: "workspace_invite",
    isRead: false,
  });

  const io = req.app.get("io");
  if (io) {
    const room = invitee._id.toString();
    io.to(room).emit("new_notification", newNotification);
    io.to(room).emit("workspace_invite", invite);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, invite, "Invite sent successfully!"));
});

// --- RESPOND TO INVITE (Accept/Decline) ---
export const respondToInvite = asyncHandler(async (req, res) => {
  const { inviteId } = req.params;
  const { action } = req.body; // Frontend sends action: "accepted" or "declined"
 
  if (!isValidObjectId(inviteId)) {
    throw new ApiError(400, "Invalid invite id.");
  }
  if (!["accepted", "declined"].includes(action)) {
    throw new ApiError(400, "Invalid action");
  }
 
  const invite = await Invite.findOne({
    _id: inviteId,
    invitee: req.user._id,
    status: "pending",
  }).populate("invitee", "username fullName");
 
  if (!invite) {
    throw new ApiError(404, "Invite not found");
  }
 
  if (invite.expiresAt < new Date()) {
    invite.status = "expired";
    await invite.save();
    throw new ApiError(410, "This invite has expired.");
  }
 
  const workspace = await Workspace.findById(invite.workspace);
  if (!workspace) {
    invite.status = "cancelled";
    await invite.save();
    throw new ApiError(404, "This workspace no longer exists.");
  }
 
  invite.status = action;
  if (action === "accepted") {
    invite.acceptedAt = new Date();
  }
  await invite.save();
 
  const io = req.app.get("io");
 
  if (action === "accepted") {
    const existingMembership = await WorkspaceMember.findOne({
      workspace: invite.workspace,
      user: req.user._id,
    });
 
    if (existingMembership) {
      existingMembership.status = "active";
      existingMembership.role = invite.role;
      existingMembership.joinedAt = new Date();
      await existingMembership.save();
    } else {
      await WorkspaceMember.create({
        workspace: invite.workspace,
        user: req.user._id,
        role: invite.role,
      });
    }
 
    if (io) {
      io.to(invite.workspace.toString()).emit("invite_response", {
        _id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
        fullName: req.user.fullName,
        role: invite.role,
        joinedAt: new Date(),
      });
 
      io.to(req.user._id.toString()).emit("workspace_joined", {
        _id: workspace._id,
        name: workspace.name,
        owner: workspace.owner,
        role: invite.role,
        joinedAt: new Date(),
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      });
    }
  }
 
  const newNotification = await Notification.create({
    user: invite.inviter,
    message: `"${invite.invitee.username}" has ${action} your invite.`,
    type: "invite_response",
    isRead: false,
  });
 
  if (io) {
    io.to(invite.inviter.toString()).emit("new_notification", newNotification);
  }
 
  return res
    .status(200)
    .json(new ApiResponse(200, {}, `Invite successfully ${action}`));
});

// --- LIST MY PENDING INVITES ---
export const getAllInvites = asyncHandler(async (req, res) => {
  await Invite.updateMany(
    {
      invitee: req.user._id,
      status: "pending",
      expiresAt: { $lte: new Date() },
    },
    { $set: { status: "expired" } }
  );

  const invites = await Invite.find({
    invitee: req.user._id,
    status: "pending",
  }).populate([
    { path: "inviter", select: "username fullName avatar" },
    { path: "workspace", select: "name" },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, invites, "Fetched all invites successfully!"));
});