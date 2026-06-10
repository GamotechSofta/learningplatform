import api from "../lib/api";

const PART_SIZE = 50 * 1024 * 1024;

export const getVideosByLesson = async (lessonId) => {
  const { data } = await api.get(`/api/videos/lesson/${lessonId}`);
  return data.data;
};

export const createVideo = async (videoData) => {
  const { data } = await api.post("/api/videos", videoData);
  return data.data;
};

const initMultipart = async (file) => {
  const { data } = await api.post("/api/videos/multipart/init", {
    fileName: file.name,
    contentType: file.type || "video/mp4",
    fileSize: file.size,
  });
  return data.data;
};

const uploadPartViaApi = async (key, uploadId, partNumber, chunk, onPartProgress) => {
  const formData = new FormData();
  formData.append("chunk", chunk, `part-${partNumber}`);
  formData.append("key", key);
  formData.append("uploadId", uploadId);
  formData.append("partNumber", String(partNumber));

  const { data } = await api.post("/api/videos/multipart/part", formData, {
    timeout: 15 * 60 * 1000,
    onUploadProgress: (event) => {
      if (onPartProgress && event.total) {
        onPartProgress(event.loaded, event.total);
      }
    },
  });

  return data.data;
};

const completeMultipart = async (key, uploadId, parts) => {
  const { data } = await api.post("/api/videos/multipart/complete", {
    key,
    uploadId,
    parts,
  });
  return data.data.videoUrl;
};

const abortMultipart = async (key, uploadId) => {
  await api.post("/api/videos/multipart/abort", { key, uploadId }).catch(() => {});
};

export const uploadVideoToS3 = async (file, onProgress) => {
  const { uploadId, key, videoUrl } = await initMultipart(file);
  const totalParts = Math.ceil(file.size / PART_SIZE);
  const parts = [];
  let uploadedBytes = 0;

  try {
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      const chunk = file.slice(start, end);
      const chunkStartBytes = uploadedBytes;

      const part = await uploadPartViaApi(key, uploadId, partNumber, chunk, (loaded) => {
        if (!onProgress) return;
        const current = chunkStartBytes + loaded;
        onProgress(Math.round((current / file.size) * 95));
      });

      parts.push(part);
      uploadedBytes += chunk.size;
      onProgress?.(Math.round((uploadedBytes / file.size) * 95));
    }

    await completeMultipart(key, uploadId, parts);
    onProgress?.(98);

    return videoUrl;
  } catch (err) {
    await abortMultipart(key, uploadId);
    throw err;
  }
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

  const videoUrl = await uploadVideoToS3(file, onProgress);

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
