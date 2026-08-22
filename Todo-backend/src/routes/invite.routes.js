import Router from "express"
import {sendInvite, respondToInvite, getAllInvites} from "../controllers/invite.controller.js"
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()
router.use(verifyJwt)
router.route("/").get(getAllInvites)
router.route("/:workspaceId/send-invite").post(sendInvite);
router.route("/:inviteId/response").post(respondToInvite);

export default router