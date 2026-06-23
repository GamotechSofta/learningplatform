import api from "../lib/api";

export const getDashboardStats = async () => {
  const { data } = await api.get("/api/tests/stats");
  return data.data;
};

export const getTests = async (params = {}) => {
  const { data } = await api.get("/api/tests", { params });
  return data;
};

export const getTestById = async (id) => {
  const { data } = await api.get(`/api/tests/${id}`);
  return data.data;
};

export const createTest = async (payload) => {
  const { data } = await api.post("/api/tests", payload);
  return data.data;
};

export const updateTest = async (id, payload) => {
  const { data } = await api.put(`/api/tests/${id}`, payload);
  return data.data;
};

export const deleteTest = async (id) => {
  await api.delete(`/api/tests/${id}`);
};

export const cloneTest = async (id) => {
  const { data } = await api.post(`/api/tests/${id}/clone`);
  return data.data;
};

export const publishTest = async (id) => {
  const { data } = await api.post(`/api/tests/${id}/publish`);
  return data.data;
};

export const unpublishTest = async (id) => {
  const { data } = await api.post(`/api/tests/${id}/unpublish`);
  return data.data;
};

export const scheduleTest = async (id, payload) => {
  const { data } = await api.post(`/api/tests/${id}/schedule`, payload);
  return data.data;
};

export const submitTest = async (payload) => {
  const { data } = await api.post("/api/tests/submit", payload);
  return data.data;
};

export const emptyTestForm = {
  name: "",
  durationMinutes: 180,
  totalMarks: 100,
  questionCount: 10,
  shuffleQuestions: true,
  shuffleOptions: true,
  negativeMarking: { enabled: false, perQuestion: 1 },
};

export const testToForm = (test) => ({
  name: test.name || "",
  durationMinutes: test.durationMinutes ?? 180,
  totalMarks: test.totalMarks ?? 100,
  questionCount: test.questionCount ?? test.questions?.length ?? 10,
  shuffleQuestions: test.shuffleQuestions ?? true,
  shuffleOptions: test.shuffleOptions ?? true,
  negativeMarking: {
    enabled: test.negativeMarking?.enabled ?? false,
    perQuestion: test.negativeMarking?.perQuestion ?? 1,
  },
});

export const formToPayload = (form, courseId) => ({
  name: form.name,
  course: courseId,
  durationMinutes: form.durationMinutes,
  totalMarks: form.totalMarks,
  questionCount: form.questionCount,
  shuffleQuestions: form.shuffleQuestions,
  shuffleOptions: form.shuffleOptions,
  negativeMarking: form.negativeMarking,
});
