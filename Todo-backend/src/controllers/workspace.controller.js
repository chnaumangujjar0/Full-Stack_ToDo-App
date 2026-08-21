import { Workspace } from "../models/workspace.model.js";
import { Invite } from "../models/invite.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

// --- 1. CREATE WORKSPACE ---
export const createWorkspace = asyncHandler( async (req, res) => {
  
    const { name } = req.body;

    if (!name.trim()) {
      throw new ApiError(400,"Workspace name is required!")
    }

    const newWorkspace = await Workspace.create({
      name,
      owner: req.user._id,
      members: [req.user._id] 
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            newWorkspace,
            "Workspace created successfully!"
        )
    )
  
})

// --- 2. SEND INVITE ---
export const sendInvite = asyncHandler (async (req, res) => {
  
    const { workspaceId } = req.params;
    const { username } = req.body;

    // Find the workspace to ensure the sender is the owner
    const workspace = await Workspace.findOne({ _id: workspaceId, owner: req.user._id });
    if (!workspace) {
      throw new ApiError(403,"Unauthorized or Workspace not found")
    }

    // Find the user being invited
    const invitee = await User.findOne({ username });
    if (!invitee) {
      throw new ApiError(404,"Invitee Not Found")
    }

    // Check if user is already a member
    if (workspace.members.includes(invitee._id)) {
      throw new ApiError(400,"User is already in this workspace")
    }

    // Check if a pending invite already exists to prevent spam
    const existingInvite = await Invite.findOne({ 
      workspace: workspace._id, 
      invitee: invitee._id, 
      status: "pending" 
    });

    if (existingInvite) {
      throw new ApiError(400,"Invite already sent.")
    }

    // 1. Create the formal Invite record
    const invite = await Invite.create({
      workspace: workspace._id,
      inviter: req.user._id,
      invitee: invitee._id,
    });

    // 2. Fire off a Notification so the UI badge updates
    await Notification.create({
      user: invitee._id,
      message: `${req.user.username || 'Someone'} invited you to join the workspace: "${workspace.name}"`,
      type: "workspace_invite",
      isRead: false
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            invite,
            "Invite sent successfully!"
        )
    )
  
})

// --- 3. RESPOND TO INVITE (Accept/Decline) ---
export const respondToInvite = asyncHandler( async (req, res) => {
  
    const { inviteId } = req.params;
    const { action } = req.body; // Frontend sends action: "accepted" or "declined"

    if (!["accepted", "declined"].includes(action)) {
      throw new ApiError(400,"Invalid action")
    }

    // Find the pending invite that specifically belongs to the logged-in user
    const invite = await Invite.findOne({ _id: inviteId, invitee: req.user._id, status: "pending" });
    if (!invite) {
      return res.status(404).json({ success: false, message: "Invite not found or already processed" });
    }

    // Update the invite status
    invite.status = action;
    await invite.save();

    // If accepted, add the user to the workspace members array
    if (action === "accepted") {
      await Workspace.findByIdAndUpdate(
        invite.workspace,
        { $addToSet: { members: req.user._id } } // $addToSet prevents duplicate entries
      );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            `Invite successfully ${action}`
        )
    );
  
  
})