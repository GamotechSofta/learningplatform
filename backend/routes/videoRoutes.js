import express from "express";
import {
  createVideo,
  uploadVideoFile,
  getVideos,
  getVideosByLesson,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";
import { uploadVideo } from "../middleware/uploadMemory.js";

const router = express.Router();

router.get("/", getVideos);
router.get("/lesson/:lessonId", getVideosByLesson);
router.get("/:id", getVideoById);

router.post(
  "/upload",
  protect,
  authorize("instructor", "admin"),
  uploadVideo.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideoFile
);
router.post("/", protect, authorize("instructor", "admin"), createVideo);
router.put("/:id", protect, authorize("instructor", "admin"), updateVideo);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteVideo);

export default router;
