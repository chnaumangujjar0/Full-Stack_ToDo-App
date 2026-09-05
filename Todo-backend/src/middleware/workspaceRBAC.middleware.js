import { isValidObjectId } from "mongoose";
import { Workspace } from "../models/workspace.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  isWorkspaceOwner,
  getActiveMembership,
} from "../utils/workspaceaccess.utils.js";

const ROLE_RANK = {
  member: 1,
  admin: 2,
  owner: 3,
};

export const loadWorkspace = asyncHandler(async (req, res, next) => {
  const { workspaceId } = req.params;

  if (!isValidObjectId(workspaceId)) {
    throw new ApiError(400, "Invalid workspace id.");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError(404, "Workspace not found.");
  }

  req.workspace = workspace;
  next();
});

export const resolveWorkspaceRole = asyncHandler(async (req, res, next) => {
  if (!req.workspace) {
    throw new Error("resolveWorkspaceRole must run after loadWorkspace.");
  }

  if (isWorkspaceOwner(req.workspace, req.user._id)) {
    req.workspaceRole = "owner";
    return next();
  }

  const membership = await getActiveMembership(req.workspace._id, req.user._id);
  req.workspaceRole = membership?.role ?? null;
  next();
});


export const requireMinimumRole = (minimumRole) => (req, res, next) => {
  const userRank = ROLE_RANK[req.workspaceRole] ?? 0;
  const requiredRank = ROLE_RANK[minimumRole];

  if (userRank < requiredRank) {
    throw new ApiError(
      403,
      minimumRole === "owner"
        ? "Only the workspace owner can perform this action."
        : "You don't have permission to perform this action."
    );
  }
  next();
};

export const requireWorkspaceMember = [
  loadWorkspace,
  resolveWorkspaceRole,
  requireMinimumRole("member"),
];

export const requireWorkspaceManager = [
  loadWorkspace,
  resolveWorkspaceRole,
  requireMinimumRole("admin"),
];

export const requireWorkspaceOwner = [
  loadWorkspace,
  resolveWorkspaceRole,
  requireMinimumRole("owner"),
];
