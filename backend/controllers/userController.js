import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { attachFallbackThumbnails } from "../utils/courseThumbnail.js";
import { attachVideoCounts } from "../utils/courseVideoCounts.js";
import { setAuthCookie } from "../utils/authCookie.js";

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "student",
  });

  const token = generateToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
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

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ success: true, count: users.length, data: users });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, role, isActive } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (typeof isActive === "boolean") user.isActive = isActive;

  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();
  res.json({ success: true, message: "User removed" });
});

export const purchaseSubscription = asyncHandler(async (req, res) => {
  res.status(400);
  throw new Error(
    "Direct purchase is disabled. Complete payment through PayU checkout."
  );
});

export const addSubscription = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { course, plan, status, endDate, amountPaid, currency, paymentId, autoRenew } =
    req.body;

  user.subscriptions.push({
    course,
    plan,
    status,
    endDate,
    amountPaid,
    currency,
    paymentId,
    autoRenew,
  });

  await user.save();

  const updatedUser = await User.findById(user._id)
    .select("-password")
    .populate("subscriptions.course", "title slug thumbnail");

  res.status(201).json({ success: true, data: updatedUser.subscriptions });
});

export const getUserSubscriptions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("subscriptions")
    .populate("subscriptions.course", "title slug thumbnail pricing");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const subscriptions = user.subscriptions.map((sub) =>
    sub.toObject ? sub.toObject() : { ...sub }
  );
  const courses = subscriptions
    .map((sub) => sub.course)
    .filter((course) => course && course._id);

  if (courses.length > 0) {
    const withThumbnails = await attachFallbackThumbnails(courses);
    const withCounts = await attachVideoCounts(withThumbnails);
    const mediaByCourse = Object.fromEntries(
      withCounts.map((course) => [course._id.toString(), course])
    );

    for (const sub of subscriptions) {
      const courseId = sub.course?._id?.toString();
      const media = courseId ? mediaByCourse[courseId] : null;
      if (!media) continue;

      if (media.thumbnail) sub.course.thumbnail = media.thumbnail;
      if (media.previewVideoUrl) sub.course.previewVideoUrl = media.previewVideoUrl;
      if (media.videoCount != null) sub.course.videoCount = media.videoCount;
    }
  }

  res.json({ success: true, data: subscriptions });
});
