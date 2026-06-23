import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subject: {
      type: String,
      trim: true,
    },
    shift: {
      type: String,
      trim: true,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswer: {
          type: String,
          default: "",
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        correctAnswer: String,
        markedForReview: {
          type: Boolean,
          default: false,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    correct: {
      type: Number,
      default: 0,
    },
    incorrect: {
      type: Number,
      default: 0,
    },
    unattempted: {
      type: Number,
      default: 0,
    },
    markedForReview: {
      type: Number,
      default: 0,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    autoSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);

export default TestAttempt;
