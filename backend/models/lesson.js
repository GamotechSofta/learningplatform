import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1 });

lessonSchema.virtual("videos", {
  ref: "Video",
  localField: "_id",
  foreignField: "lesson",
});

lessonSchema.set("toJSON", { virtuals: true });
lessonSchema.set("toObject", { virtuals: true });

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
