import express from "express";
import { submitTest } from "../controllers/questionController.js";
import {
  getDashboardStats,
  getTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  cloneTest,
  publishTest,
  unpublishTest,
  scheduleTest,
} from "../controllers/testController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get(
  "/stats",
  protect,
  authorize("admin", "instructor"),
  getDashboardStats
);

router.post(
  "/submit",
  protect,
  authorize("admin", "instructor", "student"),
  submitTest
);

router.get("/", protect, authorize("admin", "instructor"), getTests);
router.get("/:id", protect, authorize("admin", "instructor"), getTestById);
router.post("/", protect, authorize("admin", "instructor"), createTest);
router.put("/:id", protect, authorize("admin", "instructor"), updateTest);
router.delete("/:id", protect, authorize("admin"), deleteTest);
router.post("/:id/clone", protect, authorize("admin", "instructor"), cloneTest);
router.post("/:id/publish", protect, authorize("admin", "instructor"), publishTest);
router.post(
  "/:id/unpublish",
  protect,
  authorize("admin", "instructor"),
  unpublishTest
);
router.post("/:id/schedule", protect, authorize("admin", "instructor"), scheduleTest);

export default router;
