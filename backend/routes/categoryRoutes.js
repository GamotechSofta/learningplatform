import express from "express";
import {
  createCategory,
  getCategories,
  searchCategories,
  getCategoryById,
  getCategoryBySlug,
  getCoursesByCategory,
  getCategoryWithCourses,
  getCategoryFull,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/search", searchCategories);
router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id/courses", getCoursesByCategory);
router.get("/:id/full", getCategoryFull);
router.get("/:id/tree", getCategoryWithCourses);
router.get("/:id", getCategoryById);

router.post("/", protect, authorize("instructor", "admin"), createCategory);
router.put("/:id", protect, authorize("instructor", "admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

export default router;
