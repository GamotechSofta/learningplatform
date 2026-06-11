import api from "../lib/api";

export const getCourses = async (params = {}) => {
  const { data } = await api.get("/api/courses", { params });
  return data;
};

export const getCoursesVideoCounts = async () => {
  const { data } = await api.get("/api/courses/video-counts");
  return data;
};

export const getCourseById = async (id) => {
  const { data } = await api.get(`/api/courses/${id}`);
  return data.data;
};

export const getCourseWithLessons = async (id) => {
  const { data } = await api.get(`/api/courses/${id}/full`);
  return data.data;
};

export const createCourse = async (courseData) => {
  const { data } = await api.post("/api/courses", courseData);
  return data.data;
};

export const updateCourse = async (id, courseData) => {
  const { data } = await api.put(`/api/courses/${id}`, courseData);
  return data.data;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/api/courses/${id}`);
  return data;
};
