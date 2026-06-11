import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema(
  {
    monthly: {
      type: Number,
      min: 0,
    },
    yearly: {
      type: Number,
      min: 0,
    },
    lifetime: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

courseSchema.virtual("lessons", {
  ref: "Lesson",
  localField: "_id",
  foreignField: "course",
});

courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

courseSchema.methods.getPriceForPlan = function (plan) {
  return this.pricing?.[plan] ?? null;
};

const Course = mongoose.model("Course", courseSchema);

export default Course;
