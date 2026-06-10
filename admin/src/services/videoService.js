import api from "../lib/api";

export const getVideosByLesson = async (lessonId) => {
  const { data } = await api.get(`/api/videos/lesson/${lessonId}`);
  return data.data;
};

export const createVideo = async (videoData) => {
  const { data } = await api.post("/api/videos", videoData);
  return data.data;
};

export const uploadVideoFile = async (formData) => {
  const { data } = await api.post("/api/videos/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const deleteVideo = async (id) => {
  const { data } = await api.delete(`/api/videos/${id}`);
  return data;
};
