import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { createWorkspace, respondToInvite, sendInvite } from "../controllers/workspace.controller.js";

const router = Router()
router.use(verifyJwt)
router.route("/create").post(createWorkspace)
router.route("/:workspaceId/send-invite").post(sendInvite)
router.route("/:inviteId/response").post(respondToInvite)

export default router