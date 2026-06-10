import express from "express";
import {
  createVideo,
  getVideoPresignUrl,
  getVideos,
  getVideosByLesson,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/", getVideos);
router.get("/lesson/:lessonId", getVideosByLesson);
router.get("/:id", getVideoById);

router.post(
  "/presign",
  protect,
  authorize("instructor", "admin"),
  getVideoPresignUrl
);
router.post("/", protect, authorize("instructor", "admin"), createVideo);
router.put("/:id", protect, authorize("instructor", "admin"), updateVideo);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteVideo);

export default router;
