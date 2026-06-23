import api from "../lib/api";

export const getQuestions = async (params = {}) => {
  const { data } = await api.get("/api/questions", { params });
  return data;
};

export const getQuestionById = async (id, params = {}) => {
  const { data } = await api.get(`/api/questions/${id}`, { params });
  return data.data;
};

export const getQuestionsBySubject = async (subject, params = {}) => {
  const { data } = await api.get(`/api/questions/subject/${encodeURIComponent(subject)}`, {
    params,
  });
  return data;
};

export const getQuestionStats = async () => {
  const { data } = await api.get("/api/questions/stats");
  return data.data;
};

export const createQuestion = async (payload) => {
  const { data } = await api.post("/api/questions", payload);
  return data.data;
};

export const updateQuestion = async (id, payload) => {
  const { data } = await api.put(`/api/questions/${id}`, payload);
  return data.data;
};

export const deleteQuestion = async (id) => {
  await api.delete(`/api/questions/${id}`);
};

export const deleteQuestionsBulk = async (params = {}) => {
  const { data } = await api.delete("/api/questions/bulk", { params });
  return data;
};

export const importQuestions = async (payload = {}) => {
  const { data } = await api.post("/api/questions/import", payload);
  return data;
};
