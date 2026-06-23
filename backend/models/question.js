import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    questionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    shift: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 2,
        message: "At least two options are required",
      },
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },
    chapter: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    questionType: {
      type: String,
      enum: ["text", "image", "latex"],
      default: "text",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

questionSchema.index({ subject: 1, questionNumber: 1 });
questionSchema.index({ subject: 1, shift: 1, questionNumber: 1 });
questionSchema.index({ question: "text", subject: "text", shift: "text" });

const Question = mongoose.model("Question", questionSchema);

export default Question;
