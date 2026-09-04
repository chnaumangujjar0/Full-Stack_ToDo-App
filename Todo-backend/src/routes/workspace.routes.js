import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  requireWorkspaceMember,
  requireWorkspaceManager,
  requireWorkspaceOwner,
} from "../middleware/workspaceRBAC.middleware.js";
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
} from "../controllers/workspace.controller.js";

const router = Router();
router.use(verifyJwt);

// No :workspaceId on these two - nothing for the RBAC middleware to load,
// so they go straight to the controller.
router.route("/").get(getAllWorkspaces);
router.route("/create").post(createWorkspace);

// View access: any active member (or the owner).
router
  .route("/getWorkspaceById/:workspaceId")
  .get(...requireWorkspaceMember, getWorkspaceById);

// Rename: owner or admin.
router
  .route("/:workspaceId/update")
  .patch(...requireWorkspaceManager, updateWorkspace);

// Delete the whole workspace: owner only.
router
  .route("/:workspaceId/delete")
  .delete(...requireWorkspaceOwner, deleteWorkspace);

export default router;