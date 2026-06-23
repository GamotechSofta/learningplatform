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
  description: "",
  subject: "",
  chapter: "",
  durationMinutes: 180,
  totalMarks: 300,
  negativeMarking: { enabled: false, perQuestion: 1 },
  shuffleQuestions: true,
  shuffleOptions: true,
  startDate: "",
  endDate: "",
  maxAttempts: 1,
  isPaid: false,
  price: 0,
  status: "draft",
  questions: [],
  tags: [],
};

export const testToForm = (test) => ({
  name: test.name || "",
  description: test.description || "",
  subject: test.subject || "",
  chapter: test.chapter || "",
  durationMinutes: test.durationMinutes ?? 180,
  totalMarks: test.totalMarks ?? 300,
  negativeMarking: {
    enabled: test.negativeMarking?.enabled ?? false,
    perQuestion: test.negativeMarking?.perQuestion ?? 1,
  },
  shuffleQuestions: test.shuffleQuestions ?? true,
  shuffleOptions: test.shuffleOptions ?? true,
  startDate: test.startDate ? test.startDate.slice(0, 16) : "",
  endDate: test.endDate ? test.endDate.slice(0, 16) : "",
  maxAttempts: test.maxAttempts ?? 1,
  isPaid: test.isPaid ?? false,
  price: test.price ?? 0,
  status: test.status || "draft",
  questions: (test.questions || []).map((q) => (typeof q === "string" ? q : q._id)),
  tags: test.tags || [],
});

export const formToPayload = (form) => ({
  ...form,
  startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
  endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
  price: form.isPaid ? Number(form.price) || 0 : 0,
});
