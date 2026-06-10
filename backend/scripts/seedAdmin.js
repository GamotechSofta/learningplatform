import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.js";

dotenv.config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const email = "admin@gmail.com";
  const password = "admin@123";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = "Admin";
    existing.role = "admin";
    existing.isActive = true;
    existing.password = await bcrypt.hash(password, 10);
    await existing.save();
    console.log("Admin user updated:", email);
  } else {
    await User.create({
      name: "Admin",
      email,
      password: await bcrypt.hash(password, 10),
      role: "admin",
      isActive: true,
    });
    console.log("Admin user created:", email);
  }

  await mongoose.disconnect();
};

seedAdmin().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
