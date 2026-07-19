import { Router } from "express";
import { registerUser, uploadAvatar } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
const router = Router()

router.route("/register").post(registerUser)
router.route("/upload-avatar").post(upload.single("avatar"),uploadAvatar)
router.route("/upload-coverImage").post(upload.single("coverImage"),uploadAvatar)
export default router
