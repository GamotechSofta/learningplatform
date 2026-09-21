import mongoose from "mongoose";

const otpChallengeSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["login", "signup"],
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    /** Hashed OTP when we generate codes locally (no Fast2SMS OTP ID). */
    otpHash: {
      type: String,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

otpChallengeSchema.index({ phone: 1, purpose: 1 });
otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpChallenge = mongoose.model("OtpChallenge", otpChallengeSchema);

export default OtpChallenge;
