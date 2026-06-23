import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    chapter: {
      type: String,
      trim: true,
      default: "",
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    durationMinutes: {
      type: Number,
      default: 180,
      min: 1,
    },
    totalMarks: {
      type: Number,
      default: 100,
      min: 1,
    },
    negativeMarking: {
      enabled: { type: Boolean, default: false },
      perQuestion: { type: Number, default: 1, min: 0 },
    },
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
    shuffleOptions: {
      type: Boolean,
      default: true,
    },
    startDate: Date,
    endDate: Date,
    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "unpublished"],
      default: "draft",
      index: true,
    },
    publishedAt: Date,
    clonedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

testSchema.index({ name: "text", subject: "text", chapter: "text" });

const Test = mongoose.model("Test", testSchema);

export default Test;
