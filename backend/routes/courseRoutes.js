import express from "express";
import {
  createCourse,
  getCourses,
  getCoursesVideoCounts,
  getCourseById,
  getCourseBySlug,
  getCourseWithLessons,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/video-counts", getCoursesVideoCounts);
router.get("/slug/:slug", getCourseBySlug);
router.get("/:id/full", getCourseWithLessons);
router.get("/:id", getCourseById);

router.post("/", protect, authorize("instructor", "admin"), createCourse);
router.put("/:id", protect, authorize("instructor", "admin"), updateCourse);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteCourse);

export default router;
