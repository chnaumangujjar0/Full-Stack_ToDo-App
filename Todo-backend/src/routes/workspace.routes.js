import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
} from "../controllers/workspace.controller.js";

const router = Router();
router.use(verifyJwt);
router.route("/").get(getAllWorkspaces);
router.route("/getWorkspaceById/:workspaceId").get(getWorkspaceById)
router.route("/create").post(createWorkspace);
router.route("/:workspaceId/delete").delete(deleteWorkspace)
router.route("/:workspaceId/update").patch(updateWorkspace)
export default router;
