import express from "express";
import {
  createVideo,
  initVideoMultipartUpload,
  uploadVideoMultipartPart,
  completeVideoMultipartUpload,
  abortVideoMultipartUpload,
  getVideos,
  getVideosByLesson,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";
import { uploadVideoChunk } from "../middleware/uploadMemory.js";

const router = express.Router();

router.get("/", getVideos);
router.get("/lesson/:lessonId", getVideosByLesson);
router.get("/:id", getVideoById);

router.post(
  "/multipart/init",
  protect,
  authorize("instructor", "admin"),
  initVideoMultipartUpload
);
router.post(
  "/multipart/part",
  protect,
  authorize("instructor", "admin"),
  uploadVideoChunk.single("chunk"),
  uploadVideoMultipartPart
);
router.post(
  "/multipart/complete",
  protect,
  authorize("instructor", "admin"),
  completeVideoMultipartUpload
);
router.post(
  "/multipart/abort",
  protect,
  authorize("instructor", "admin"),
  abortVideoMultipartUpload
);

router.post("/", protect, authorize("instructor", "admin"), createVideo);
router.put("/:id", protect, authorize("instructor", "admin"), updateVideo);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteVideo);

export default router;
