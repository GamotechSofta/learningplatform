import api from "../lib/api";

export const getLessonsByCourse = async (courseId) => {
  const { data } = await api.get(`/api/lessons/course/${courseId}`);
  return data.data;
};

export const getLessonWithVideos = async (lessonId) => {
  const { data } = await api.get(`/api/lessons/${lessonId}/full`);
  return data.data;
};

export const createLesson = async (lessonData) => {
  const { data } = await api.post("/api/lessons", lessonData);
  return data.data;
};

export const deleteLesson = async (id) => {
  const { data } = await api.delete(`/api/lessons/${id}`);
  return data;
};
