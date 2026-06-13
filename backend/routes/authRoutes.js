import express from "express";
import {
  loginUser,
  logoutUser,
  getMe,
  updateMyLearningTrack,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);
router.put("/me/learning-track", protect, updateMyLearningTrack);

export default router;
