import crypto from "crypto";
import mongoose from "mongoose";

const paymentOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
      required: true,
    },
    txnid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true,
    },
    payuPaymentId: {
      type: String,
    },
    payuStatus: {
      type: String,
    },
    productinfo: {
      type: String,
    },
    checkoutToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    customerName: {
      type: String,
    },
    customerEmail: {
      type: String,
    },
    returnBaseUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const PaymentOrder = mongoose.model("PaymentOrder", paymentOrderSchema);

export default PaymentOrder;
