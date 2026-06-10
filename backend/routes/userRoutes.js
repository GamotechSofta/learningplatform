import express from "express";
import {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addSubscription,
  getUserSubscriptions,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";

const router = express.Router();

router.post("/register", registerUser);

router.get("/", protect, authorize("admin"), getUsers);
router.get("/:id", protect, authorize("admin"), getUserById);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);
router.get("/:id/subscriptions", protect, getUserSubscriptions);
router.post("/:id/subscriptions", protect, addSubscription);

export default router;
