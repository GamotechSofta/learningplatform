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

export const getQuestionStats = async (params = {}) => {
  const { data } = await api.get("/api/questions/stats", { params });
  return data.data;
};

export const getDuplicateQuestions = async (courseId) => {
  const { data } = await api.get("/api/questions/duplicates", {
    params: courseId ? { course: courseId } : {},
  });
  return data.data;
};

export const previewCsvImport = async (csvText, courseId) => {
  const { data } = await api.post("/api/questions/import/preview", { csvText, courseId });
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
  const { data } = await api.delete(`/api/questions/${id}`);
  return data;
};

export const permanentDeleteQuestion = async (id) => {
  await api.delete(`/api/questions/${id}/permanent`);
};

export const restoreQuestion = async (id) => {
  const { data } = await api.post(`/api/questions/${id}/restore`);
  return data;
};

export const bulkSoftDelete = async (ids) => {
  const { data } = await api.post("/api/questions/bulk/soft-delete", { ids });
  return data;
};

export const bulkRestore = async (ids) => {
  const { data } = await api.post("/api/questions/bulk/restore", { ids });
  return data;
};

export const bulkUpdateQuestions = async (ids, updates) => {
  const { data } = await api.put("/api/questions/bulk/update", { ids, updates });
  return data;
};

export const cloneQuestion = async (id) => {
  const { data } = await api.post(`/api/questions/${id}/clone`);
  return data.data;
};

export const getQuestionVersions = async (id) => {
  const { data } = await api.get(`/api/questions/${id}/versions`);
  return data.data;
};

export const deleteQuestionsBulk = async (params = {}) => {
  const { data } = await api.delete("/api/questions/bulk", { params });
  return data;
};

export const importQuestions = async (payload = {}) => {
  const { data } = await api.post("/api/questions/import", payload);
  return data;
};

export const exportQuestions = async (params = {}, format = "json") => {
  if (format === "csv") {
    const response = await api.get("/api/questions/export", {
      params: { ...params, format: "csv" },
      responseType: "blob",
    });
    return response.data;
  }
  const { data } = await api.get("/api/questions/export", { params: { ...params, format: "json" } });
  return data;
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
