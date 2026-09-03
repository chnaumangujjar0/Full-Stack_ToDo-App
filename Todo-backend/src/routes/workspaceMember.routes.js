import { Router } from "express";

import {
  addMember,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
  leaveWorkspace,
} from "../controllers/workspacemember.controller.js";

import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/:workspaceId/add").post( addMember);
router.route("/:workspaceId").get( getWorkspaceMembers);
router.route("/:workspaceId/role").patch( updateMemberRole);
router.route("/:workspaceId/delete").patch( removeMember);
router.route("/:workspaceId/leave").delete( leaveWorkspace);

export default router;

