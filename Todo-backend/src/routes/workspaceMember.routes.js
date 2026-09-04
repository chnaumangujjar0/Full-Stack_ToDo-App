import { Router } from "express";

import {
  addMember,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
  leaveWorkspace,
} from "../controllers/workspacemember.controller.js";

import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  requireWorkspaceMember,
  requireWorkspaceManager,
  requireWorkspaceOwner,
} from "../middleware/workspaceRBAC.middleware.js";

const router = Router();

router.use(verifyJwt);

// Invite a member: owner or admin.
router.route("/:workspaceId/add").post(...requireWorkspaceManager, addMember);
router.route("/:workspaceId").get(...requireWorkspaceMember, getWorkspaceMembers);
router.route("/:workspaceId/role").patch(...requireWorkspaceOwner, updateMemberRole);
router.route("/:workspaceId/delete").patch(...requireWorkspaceManager, removeMember);
router.route("/:workspaceId/leave").delete(...requireWorkspaceMember, leaveWorkspace);

export default router;