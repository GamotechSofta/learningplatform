import axios from "axios";
import api from "../lib/api";

export const getVideosByLesson = async (lessonId) => {
  const { data } = await api.get(`/api/videos/lesson/${lessonId}`);
  return data.data;
};

export const createVideo = async (videoData) => {
  const { data } = await api.post("/api/videos", videoData);
  return data.data;
};

export const getVideoPresignUrl = async (fileName, contentType) => {
  const { data } = await api.post("/api/videos/presign", { fileName, contentType });
  return data.data;
};

export const uploadVideoToS3 = async (file, onProgress) => {
  const contentType = file.type || "video/mp4";
  const { uploadUrl, videoUrl } = await getVideoPresignUrl(file.name, contentType);

  try {
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": contentType },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
  } catch {
    throw new Error(
      "Failed to upload video to S3. Run `npm run configure:s3-cors` on the backend to allow browser uploads."
    );
  }

  return videoUrl;
};

export const uploadVideoFile = async (payload, onProgress) => {
  const {
    file,
    lessonId,
    title,
    description,
    thumbnail,
    duration,
    isPublished,
    order,
  } = payload;

  const videoUrl = await uploadVideoToS3(file, (progress) => {
    onProgress?.(Math.min(progress, 95));
  });

  onProgress?.(98);

  const video = await createVideo({
    lesson: lessonId,
    title,
    description: description || undefined,
    videoUrl,
    thumbnail: thumbnail || undefined,
    duration: Number(duration) || 0,
    order,
    isPublished,
  });

  onProgress?.(100);
  return video;
};

export const deleteVideo = async (id) => {
  const { data } = await api.delete(`/api/videos/${id}`);
  return data;
};
