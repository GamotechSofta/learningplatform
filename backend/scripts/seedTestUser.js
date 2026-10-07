import dotenv from "dotenv";
import mongoose from "mongoose";
import { ensureTestUser } from "../utils/testUser.js";

dotenv.config();

const seedTestUser = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const result = await ensureTestUser({ resetPassword: true });
  if (!result) {
    console.error("Set TEST_OTP_PHONE and TEST_OTP_CODE in .env first.");
    process.exitCode = 1;
  } else {
    const { user, created, granted } = result;
    console.log(`Test user ${created ? "created" : "updated"}:`, user.email, user.phone);
    console.log(`Paid courses newly unlocked: ${granted}, total subscriptions: ${user.subscriptions.length}`);
  }

  await mongoose.disconnect();
};

seedTestUser().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
