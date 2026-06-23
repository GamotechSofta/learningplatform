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
      trim: true,
      default: "",
      index: true,
    },
    year: {
      type: Number,
      index: true,
    },
    chapter: {
      type: String,
      trim: true,
      default: "",
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
      type: Number,
      required: true,
      min: 1,
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
    image: {
      type: String,
      trim: true,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    questionType: {
      type: String,
      enum: ["text", "image", "latex", "rich"],
      default: "text",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

questionSchema.index({ course: 1, subject: 1, chapter: 1 });
questionSchema.index({ subject: 1, questionNumber: 1 });
questionSchema.index({ question: "text", subject: "text", chapter: "text" });

questionSchema.pre("save", function normalizeFields() {
  if (this.correctAnswer != null) {
    this.correctAnswer = Number(this.correctAnswer);
  }
});

questionSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.imageUrl = ret.image || ret.imageUrl || "";
    return ret;
  },
});

questionSchema.virtual("imageUrl").get(function getImageUrl() {
  return this.image;
});

const Question = mongoose.model("Question", questionSchema);

export default Question;
