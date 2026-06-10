import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorizeRoles.js";
import { uploadImage as uploadImageMiddleware } from "../middleware/uploadMemory.js";

const router = express.Router();

router.post(
  "/image",
  protect,
  authorize("instructor", "admin"),
  uploadImageMiddleware.single("image"),
  uploadImage
);

export default router;
