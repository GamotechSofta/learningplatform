import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { normalizePhone } from "./phone.js";

/**
 * Test / Play Store review account. Enabled only when TEST_OTP_PHONE and
 * TEST_OTP_CODE are set; phone OTP login for it accepts the fixed code.
 */
export const testUserConfig = () => {
  const phone = normalizePhone(process.env.TEST_OTP_PHONE || "");
  const code = process.env.TEST_OTP_CODE?.trim() || "";
  if (!phone || !code) return null;

  return {
    name: process.env.TEST_USER_NAME?.trim() || "Test User",
    email: (process.env.TEST_USER_EMAIL?.trim() || "test@vidyank.com").toLowerCase(),
    password: process.env.TEST_USER_PASSWORD?.trim() || "Test@123",
    phone,
  };
};

/** Creates or updates the test account; returns null when not configured. */
export const ensureTestUser = async ({ resetPassword = false } = {}) => {
  const config = testUserConfig();
  if (!config) return null;

  const { name, email, password, phone } = config;
  const existing =
    (await User.findOne({ phone }).select("+password")) ||
    (await User.findOne({ email }).select("+password"));

  if (existing) {
    existing.phone = phone;
    existing.phoneVerified = true;
    existing.isActive = true;
    existing.learningTrack = existing.learningTrack || "explore_all";
    if (resetPassword || !existing.password) {
      existing.password = await bcrypt.hash(password, 10);
    }
    await existing.save();
    return { user: existing, created: false };
  }

  const user = await User.create({
    name,
    email,
    phone,
    phoneVerified: true,
    password: await bcrypt.hash(password, 10),
    role: "student",
    isActive: true,
    learningTrack: "explore_all",
  });
  return { user, created: true };
};
