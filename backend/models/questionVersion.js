import mongoose from "mongoose";

const questionVersionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    changeNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

questionVersionSchema.index({ questionId: 1, version: -1 });

const QuestionVersion = mongoose.model("QuestionVersion", questionVersionSchema);

export default QuestionVersion;
