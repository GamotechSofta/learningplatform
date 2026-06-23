import express from "express";
import {
  getQuestions,
  getQuestionById,
  getQuestionsBySubject,
  getQuestionStatsHandler,
  getDuplicateQuestions,
  previewImport,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  permanentDeleteQuestion,
  restoreQuestion,
  bulkSoftDelete,
  bulkRestore,
  bulkUpdateQuestions,
  deleteAllQuestions,
  importQuestions,
  cloneQuestion,
  getQuestionVersions,
  exportQuestionsHandler,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/stats", protect, authorize("admin", "instructor"), getQuestionStatsHandler);
router.get("/duplicates", protect, authorize("admin", "instructor"), getDuplicateQuestions);
router.get("/export", protect, authorize("admin", "instructor"), exportQuestionsHandler);
router.post("/import/preview", protect, authorize("admin", "instructor"), previewImport);
router.post("/import", protect, authorize("admin", "instructor"), importQuestions);
router.post("/bulk/soft-delete", protect, authorize("admin", "instructor"), bulkSoftDelete);
router.post("/bulk/restore", protect, authorize("admin", "instructor"), bulkRestore);
router.put("/bulk/update", protect, authorize("admin", "instructor"), bulkUpdateQuestions);
router.get("/subject/:subject", getQuestionsBySubject);
router.get("/", getQuestions);
router.post("/:id/clone", protect, authorize("admin", "instructor"), cloneQuestion);
router.get("/:id/versions", protect, authorize("admin", "instructor"), getQuestionVersions);
router.post("/:id/restore", protect, authorize("admin", "instructor"), restoreQuestion);
router.delete("/:id/permanent", protect, authorize("admin"), permanentDeleteQuestion);
router.get("/:id", getQuestionById);
router.post("/", protect, authorize("admin", "instructor"), createQuestion);
router.put("/:id", protect, authorize("admin", "instructor"), updateQuestion);
router.delete("/bulk", protect, authorize("admin"), deleteAllQuestions);
router.delete("/:id", protect, authorize("admin", "instructor"), deleteQuestion);

export default router;
