import { Router } from "express";
import { currentUser, login, logout, registerUser, uploadAvatar } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import {verifyJwt} from "../middleware/auth.middleware.js"
const router = Router()

router.route("/register").post(registerUser)
router.route("/upload-avatar").post(upload.single("avatar"),verifyJwt,uploadAvatar)
router.route("/upload-coverImage").post(upload.single("coverImage"),verifyJwt,uploadAvatar)
router.route("/login").post(login)
router.route("/logout").post(verifyJwt,logout)
router.route("/current-user").get(verifyJwt,currentUser)
export default router
