import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { setAuthCookie, clearAuthCookie } from "../utils/authCookie.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error("Account is deactivated");
  }

  const token = generateToken(user);
  setAuthCookie(res, token);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      learningTrack: user.learningTrack ?? null,
      token,
    },
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: "Logged out" });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

const LEARNING_TRACKS = ["class_8_10", "class_11_12", "jee", "skills", "explore_all"];

export const updateMyLearningTrack = asyncHandler(async (req, res) => {
  const { learningTrack } = req.body;

  if (!LEARNING_TRACKS.includes(learningTrack)) {
    res.status(400);
    throw new Error("Invalid learning track");
  }

  req.user.learningTrack = learningTrack;
  await req.user.save();

  res.json({
    success: true,
    data: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      learningTrack: req.user.learningTrack,
    },
  });
});
