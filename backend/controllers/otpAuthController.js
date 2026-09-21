import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import OtpChallenge from "../models/otpChallenge.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { setAuthCookie } from "../utils/authCookie.js";
import { sendOtpChallenge, verifyOtpChallenge } from "../utils/fast2sms.js";
import { isValidIndianPhone, normalizePhone } from "../utils/phone.js";

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const generateSignupToken = ({ phone, name, email }) =>
  jwt.sign(
    { phone, name, email, purpose: "signup" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

const authUserPayload = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? null,
  role: user.role,
  learningTrack: user.learningTrack ?? null,
  token,
});

export const sendLoginOtp = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);

  if (!isValidIndianPhone(phone)) {
    res.status(400);
    throw new Error("Enter a valid 10-digit Indian mobile number");
  }

  const user = await User.findOne({ phone });
  if (!user) {
    res.status(404);
    throw new Error("No account found with this mobile number. Please sign up.");
  }
  if (!user.isActive) {
    res.status(401);
    throw new Error("Account is deactivated");
  }

  const result = await sendOtpChallenge({ phone, purpose: "login" });

  res.json({
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
});

export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const { otp } = req.body;

  if (!isValidIndianPhone(phone)) {
    res.status(400);
    throw new Error("Enter a valid 10-digit Indian mobile number");
  }
  if (!otp) {
    res.status(400);
    throw new Error("OTP is required");
  }

  await verifyOtpChallenge({ phone, purpose: "login", otp });

  const user = await User.findOne({ phone });
  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Unable to log in with this mobile number");
  }

  await OtpChallenge.deleteMany({ phone, purpose: "login" });

  const token = generateToken(user);
  setAuthCookie(res, token);

  res.json({
    success: true,
    data: authUserPayload(user, token),
  });
});

export const sendSignupOtp = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const phone = normalizePhone(req.body.phone);

  if (!name) {
    res.status(400);
    throw new Error("Name is required");
  }
  if (!email || !email.includes("@")) {
    res.status(400);
    throw new Error("Valid email is required");
  }
  if (!isValidIndianPhone(phone)) {
    res.status(400);
    throw new Error("Enter a valid 10-digit Indian mobile number");
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    res.status(400);
    throw new Error("User already exists with this mobile number");
  }

  const result = await sendOtpChallenge({
    phone,
    purpose: "signup",
    name,
    email,
  });

  res.json({
    success: true,
    message: "OTP sent successfully",
    data: result,
  });
});

export const verifySignupOtp = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const { otp } = req.body;

  if (!isValidIndianPhone(phone)) {
    res.status(400);
    throw new Error("Enter a valid 10-digit Indian mobile number");
  }
  if (!otp) {
    res.status(400);
    throw new Error("OTP is required");
  }

  const challenge = await verifyOtpChallenge({ phone, purpose: "signup", otp });

  if (!challenge.name || !challenge.email) {
    res.status(400);
    throw new Error("Signup session expired. Please start again.");
  }

  const signupToken = generateSignupToken({
    phone: challenge.phone,
    name: challenge.name,
    email: challenge.email,
  });

  res.json({
    success: true,
    message: "OTP verified",
    data: {
      signupToken,
      phone: challenge.phone,
      name: challenge.name,
      email: challenge.email,
    },
  });
});

export const completeSignup = asyncHandler(async (req, res) => {
  const { signupToken, password, confirmPassword } = req.body;

  if (!signupToken) {
    res.status(400);
    throw new Error("Signup session expired. Please verify OTP again.");
  }
  if (!password || String(password).length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }
  if (confirmPassword != null && password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  let payload;
  try {
    payload = jwt.verify(signupToken, process.env.JWT_SECRET);
  } catch {
    res.status(400);
    throw new Error("Signup session expired. Please verify OTP again.");
  }

  if (payload.purpose !== "signup" || !payload.phone || !payload.email || !payload.name) {
    res.status(400);
    throw new Error("Invalid signup session");
  }

  const phone = normalizePhone(payload.phone);
  const email = String(payload.email).toLowerCase();
  const name = String(payload.name).trim();

  const challenge = await OtpChallenge.findOne({
    phone,
    purpose: "signup",
    verified: true,
  });
  if (!challenge) {
    res.status(400);
    throw new Error("Please verify your mobile number with OTP first");
  }

  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("User already exists with this email");
  }
  if (await User.findOne({ phone })) {
    res.status(400);
    throw new Error("User already exists with this mobile number");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    phone,
    phoneVerified: true,
    password: hashedPassword,
    role: "student",
  });

  await OtpChallenge.deleteMany({ phone, purpose: "signup" });

  const token = generateToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    data: authUserPayload(user, token),
  });
});
