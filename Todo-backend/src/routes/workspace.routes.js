import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
} from "../controllers/workspace.controller.js";

const router = Router();
router.use(verifyJwt);
router.route("/").get(getAllWorkspaces);
router.route("/getWorkspaceById/:workspaceId").get(getWorkspaceById)
router.route("/create").post(createWorkspace);


export default router;
