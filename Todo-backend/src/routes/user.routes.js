import { Router } from "express";
import { changePassword, currentUser, login, logout, registerUser, updateDetails, uploadAvatar } from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import {verifyJwt} from "../middleware/auth.middleware.js"
const router = Router()

router.route("/register").post(registerUser)
router.route("/upload-avatar").post(upload.single("avatar"),verifyJwt,uploadAvatar)
router.route("/upload-coverImage").post(upload.single("coverImage"),verifyJwt,uploadAvatar)
router.route("/login").post(login)
router.route("/logout").post(verifyJwt,logout)
router.route("/current-user").get(verifyJwt,currentUser)
router.route("/update-details").patch(upload.fields([
    {
        name: "avatarFile",
        maxCount: 1
    },
    {
        name: "coverFile",
        maxCount: 1
    }
]),verifyJwt,updateDetails)
router.route("/change-password").patch(verifyJwt,changePassword)
export default router
