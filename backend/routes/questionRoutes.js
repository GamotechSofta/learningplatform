import express from "express";
import {
  getQuestions,
  getQuestionById,
  getQuestionsBySubject,
  getQuestionStatsHandler,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  deleteAllQuestions,
  importQuestions,
  submitTest,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/stats", protect, authorize("admin", "instructor"), getQuestionStatsHandler);
router.post("/import", protect, authorize("admin", "instructor"), importQuestions);
router.get("/subject/:subject", getQuestionsBySubject);
router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.post("/", protect, authorize("admin", "instructor"), createQuestion);
router.put("/:id", protect, authorize("admin", "instructor"), updateQuestion);
router.delete("/bulk", protect, authorize("admin"), deleteAllQuestions);
router.delete("/:id", protect, authorize("admin", "instructor"), deleteQuestion);

export default router;
