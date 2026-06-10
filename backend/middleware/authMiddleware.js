import jwt from "jsonwebtoken";
import User from "../models/user.js";
import asyncHandler from "./asyncHandler.js";
import { getTokenFromRequest } from "../utils/authCookie.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("Not authorized");
    }

    req.user = user;
    next();
  } catch {
    res.status(401);
    throw new Error("Not authorized, invalid token");
  }
});
