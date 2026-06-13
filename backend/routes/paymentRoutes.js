import express from "express";
import {
  getPayUPaymentStatus,
  initiatePayUPayment,
  launchPayUCheckout,
  payuReturnFailure,
  payuReturnSuccess,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/payu/initiate", protect, initiatePayUPayment);
router.get("/payu/launch/:token", launchPayUCheckout);
router.get("/payu/status/:txnid", protect, getPayUPaymentStatus);
router.post("/payu/return/success", payuReturnSuccess);
router.post("/payu/return/failure", payuReturnFailure);
router.get("/payu/return/success", payuReturnSuccess);
router.get("/payu/return/failure", payuReturnFailure);

export default router;
