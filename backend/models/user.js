import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    plan: {
      type: String,
      enum: ["monthly", "yearly", "lifetime"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paymentId: {
      type: String,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin", "instructor"],
      default: "student",
    },
    subscriptions: [subscriptionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.hasActiveSubscription = function (courseId) {
  const now = new Date();
  return this.subscriptions.some(
    (sub) =>
      sub.course.toString() === courseId.toString() &&
      sub.status === "active" &&
      (!sub.endDate || sub.endDate > now)
  );
};

const User = mongoose.model("User", userSchema);

export default User;
