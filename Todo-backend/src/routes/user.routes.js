import { Router } from "express";
import {
  changeForgotPassword,
  currentUser,
  login,
  logout,
  registerUser,
  requestForgotPasswordOtp,
  requestPasswordReset,
  updateDetails,
  uploadAvatar,
  verifyForgotPasswordOtp,
  verifyResetPassword,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/upload-avatar").post(upload.single("avatar"), verifyJwt, uploadAvatar);
router.route("/upload-coverImage").post(upload.single("coverImage"), verifyJwt, uploadAvatar);
router.route("/login").post(login);
router.route("/logout").post(verifyJwt, logout);
router.route("/current-user").get(verifyJwt, currentUser);
router.route("/update-details").patch(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  verifyJwt,
  updateDetails,
);
router.route("/request-reset-password").post(verifyJwt,requestPasswordReset)
router.route("/verify-reset-password").patch(verifyJwt, verifyResetPassword);
router.route("/request-forgot-password-otp").post(requestForgotPasswordOtp)
router.route("/verify-forgot-password-otp").post(verifyForgotPasswordOtp)
router.route("/change-forgot-password").patch(changeForgotPassword)
export default router;
