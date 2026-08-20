import { Router } from "express";
import { getLoginHistory } from "../controllers/loginActivity.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js"; 

const router = Router();


router.route("/login-history").get(verifyJwt, getLoginHistory);

export default router;