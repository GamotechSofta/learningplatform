import dotenv from "dotenv";
import mongoose from "mongoose";
import Question from "../models/question.js";

dotenv.config();

const extractAlignRowValue = (row) => {
  const cleaned = String(row || "")
    .replace(/\\end\{align\*?\}.*$/i, "")
    .replace(/\\\]\s*$/i, "")
    .trim();

  const labeled = cleaned.match(/\(\s*\d+\s*\)\s*&\s*(.+?)(?:\\\\)?\s*$/);
  if (labeled) return labeled[1].trim();

  const plain = cleaned.match(/^&\s*(.+?)(?:\\\\)?\s*$/);
  if (plain) return plain[1].trim();

  return cleaned;
};

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const broken = await Question.find({
    isDeleted: { $ne: true },
    options: { $elemMatch: { $regex: /^&\s*/ } },
  });

  let fixed = 0;

  for (const question of broken) {
    const stem = question.question
      .replace(/\\\[\s*\\begin\{align\*?\}\s*$/i, "")
      .trim();
    const options = question.options.map(extractAlignRowValue);

    question.question = stem;
    question.options = options;
    await question.save();
    fixed += 1;
  }

  console.log(`Fixed ${fixed} mis-parsed align questions.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
