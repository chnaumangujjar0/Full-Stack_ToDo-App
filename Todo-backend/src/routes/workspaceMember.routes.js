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

router.route("/:workspaceId/members").post( addMember);
router.route("/:workspaceId/members").get( getWorkspaceMembers);
router.route("/:workspaceId/members/role").patch( updateMemberRole);
router.route("/:workspaceId/members").delete( removeMember);
router.route("/:workspaceId/members/leave").delete( leaveWorkspace);

export default router;

