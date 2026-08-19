import { Router } from "express";
import { getAllNotifications, markAsRead } from "../controllers/notification.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/").get(verifyJwt,getAllNotifications)
router.route("/:notificationId/read").patch(verifyJwt,markAsRead)

export default router;