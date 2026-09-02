import { WorkspaceMember } from "../models/workspaceMember.model.js";
import { ApiError } from "./apiError.js";

export const isWorkspaceOwner = (workspace, userId) =>
  workspace.owner.toString() === userId.toString();

export const getActiveMembership = (workspaceId, userId) =>
  WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
    status: "active",
  });

export const assertCanManageWorkspace = async (workspace, userId) => {
  if (isWorkspaceOwner(workspace, userId)) return;

  const membership = await getActiveMembership(workspace._id, userId);
  if (!membership || membership.role !== "admin") {
    throw new ApiError(403, "You don't have permission to manage this workspace.");
  }
};


export const assertIsWorkspaceMember = async (workspace, userId) => {
  if (isWorkspaceOwner(workspace, userId)) return;

  const membership = await getActiveMembership(workspace._id, userId);
  if (!membership) {
    throw new ApiError(403, "You do not have access to this workspace.");
  }
};