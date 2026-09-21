import express from "express";
import {
  loginUser,
  logoutUser,
  getMe,
  updateMyLearningTrack,
} from "../controllers/authController.js";
import {
  sendLoginOtp,
  verifyLoginOtp,
  sendSignupOtp,
  verifySignupOtp,
  completeSignup,
} from "../controllers/otpAuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/login/send-otp", sendLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);
router.post("/signup/send-otp", sendSignupOtp);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/signup/complete", completeSignup);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);
router.put("/me/learning-track", protect, updateMyLearningTrack);

export default router;
