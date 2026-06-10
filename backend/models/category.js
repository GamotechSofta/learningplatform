import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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
      trim: true,
    },
    thumbnail: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ name: "text", description: "text" });
categorySchema.index({ order: 1 });

categorySchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "category",
});

categorySchema.virtual("coursesCount", {
  ref: "Course",
  localField: "_id",
  foreignField: "category",
  count: true,
});

categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;
