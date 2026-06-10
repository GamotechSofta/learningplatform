import express from "express";
import {
  createLesson,
  getLessons,
  getLessonsByCourse,
  getLessonById,
  getLessonWithVideos,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/", getLessons);
router.get("/course/:courseId", getLessonsByCourse);
router.get("/:id/full", getLessonWithVideos);
router.get("/:id", getLessonById);

router.post("/", protect, authorize("instructor", "admin"), createLesson);
router.put("/:id", protect, authorize("instructor", "admin"), updateLesson);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteLesson);

export default router;
