import bcrypt from "bcryptjs";
import Course from "../models/course.js";
import User from "../models/user.js";
import { normalizePhone } from "./phone.js";

const TEST_ACCESS_PAYMENT_ID = "test-account-full-access";

/** Gives the test account an active lifetime subscription to every paid course. */
const grantAllPaidCourses = async (user) => {
  const paidCourses = await Course.find({
    $or: [
      { "pricing.monthly": { $gt: 0 } },
      { "pricing.yearly": { $gt: 0 } },
      { "pricing.lifetime": { $gt: 0 } },
    ],
  }).select("_id");

  const now = new Date();
  const covered = new Set(
    user.subscriptions
      .filter((sub) => sub.status === "active" && (!sub.endDate || sub.endDate > now))
      .map((sub) => sub.course.toString())
  );

  let granted = 0;
  for (const course of paidCourses) {
    if (covered.has(course._id.toString())) continue;
    user.subscriptions.push({
      course: course._id,
      plan: "lifetime",
      status: "active",
      startDate: now,
      endDate: null,
      amountPaid: 0,
      currency: "INR",
      paymentId: TEST_ACCESS_PAYMENT_ID,
      autoRenew: false,
    });
    granted += 1;
  }
  return granted;
};

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
    const granted = await grantAllPaidCourses(existing);
    await existing.save();
    return { user: existing, created: false, granted };
  }

  const user = new User({
    name,
    email,
    phone,
    phoneVerified: true,
    password: await bcrypt.hash(password, 10),
    role: "student",
    isActive: true,
    learningTrack: "explore_all",
  });
  const granted = await grantAllPaidCourses(user);
  await user.save();
  return { user, created: true, granted };
};
