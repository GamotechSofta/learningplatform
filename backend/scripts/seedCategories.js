import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../models/category.js";

dotenv.config();

const categories = [
  {
    name: "Marketing",
    slug: "marketing",
    description: "Digital marketing, branding, and growth courses",
    order: 1,
  },
  {
    name: "SEO",
    slug: "seo",
    description: "Search engine optimization and content strategy",
    order: 2,
  },
  {
    name: "Searching",
    slug: "searching",
    description: "Research, discovery, and search-focused skills",
    order: 3,
  },
];

const seedCategories = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const item of categories) {
    const existing = await Category.findOne({ slug: item.slug });
    if (existing) {
      Object.assign(existing, item);
      await existing.save();
      console.log("Category updated:", item.name);
    } else {
      await Category.create(item);
      console.log("Category created:", item.name);
    }
  }

  await mongoose.disconnect();
};

seedCategories().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
