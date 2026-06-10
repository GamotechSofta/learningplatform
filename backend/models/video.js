import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
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
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    duration: {
      type: Number,
      min: 0,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

videoSchema.index({ lesson: 1, order: 1 });

const Video = mongoose.model("Video", videoSchema);

export default Video;
