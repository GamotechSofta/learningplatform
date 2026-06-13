import mongoose from "mongoose";
import { getPublicUrl } from "../utils/s3.js";

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
    // S3 object key for the uploaded video, e.g. "videos/1719000000000-aws-devops.mp4".
    // We store the KEY only — the playable CloudFront URL is derived on read.
    videoKey: {
      type: String,
      trim: true,
    },
    // S3 object key for the thumbnail, e.g. "thumbnails/aws-devops.jpg".
    thumbnailKey: {
      type: String,
      trim: true,
    },
    // For externally hosted videos (paste-a-URL mode). Not an S3 key.
    externalUrl: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Size in bytes (informational).
    size: {
      type: Number,
      min: 0,
      default: 0,
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
    // Set false when S3 file fails integrity checks (corrupt / wrong format).
    mediaValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

videoSchema.index({ lesson: 1, order: 1 });

// Resolve the playable URL: uploaded video (CDN) > external URL > legacy stored value.
videoSchema.virtual("videoUrl").get(function () {
  if (this.videoKey) return getPublicUrl(this.videoKey);
  if (this.externalUrl) return this.externalUrl;
  // Backward-compat: documents created before the key-based refactor stored a
  // full URL in a "videoUrl" field. It still lives in the raw document.
  return this._doc?.videoUrl || "";
});

// Resolve the thumbnail URL: uploaded thumbnail (CDN) > legacy stored value.
videoSchema.virtual("thumbnail").get(function () {
  if (this.thumbnailKey) return getPublicUrl(this.thumbnailKey);
  return this._doc?.thumbnail || "";
});

videoSchema.set("toJSON", { virtuals: true });
videoSchema.set("toObject", { virtuals: true });

const Video = mongoose.model("Video", videoSchema);

export default Video;
