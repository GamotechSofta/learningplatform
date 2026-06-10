import api from "../lib/api";

/* ----------------------------- CRUD / queries ---------------------------- */

export const getVideosByLesson = async (lessonId) => {
  const { data } = await api.get(`/api/videos/lesson/${lessonId}`);
  return data.data;
};

export const createVideo = async (videoData) => {
  const { data } = await api.post("/api/videos", videoData);
  return data.data;
};

export const deleteVideo = async (id) => {
  const { data } = await api.delete(`/api/videos/${id}`);
  return data;
};

/* ----------------------- Multipart upload endpoints ----------------------- */

export const initMultipartUpload = async ({ fileName, contentType, fileSize }) => {
  const { data } = await api.post("/api/videos/multipart/init", {
    fileName,
    contentType,
    fileSize,
  });
  return data.data; // { uploadId, key, partSize }
};

export const presignPart = async ({ uploadId, key, partNumber }) => {
  const { data } = await api.post("/api/videos/multipart/presign", {
    uploadId,
    key,
    partNumber,
  });
  return data.data.url;
};

export const completeMultipartUpload = async ({ uploadId, key, parts }) => {
  const { data } = await api.post("/api/videos/multipart/complete", {
    uploadId,
    key,
    parts,
  });
  return data.data; // { videoKey, videoUrl }
};

export const abortMultipartUpload = async ({ uploadId, key }) => {
  // Best-effort cleanup; never throw from here.
  try {
    await api.post("/api/videos/multipart/abort", { uploadId, key });
  } catch {
    /* ignore */
  }
};
