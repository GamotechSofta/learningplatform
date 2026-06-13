import jwt from "jsonwebtoken";
import User from "../models/user.js";
import asyncHandler from "./asyncHandler.js";
import { getTokenFromRequest } from "../utils/authCookie.js";

export const optionalProtect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user?.isActive) {
      req.user = user;
    }
  } catch {
    // Ignore invalid tokens for public endpoints with optional auth.
  }

  next();
});
