import express from "express";
import { getCatalogRevision } from "../controllers/catalogController.js";

const router = express.Router();

router.get("/revision", getCatalogRevision);

export default router;
