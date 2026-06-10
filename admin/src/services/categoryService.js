import api from "../lib/api";

export const getCategories = async (params = {}) => {
  const { data } = await api.get("/api/categories", { params });
  return data;
};

export const searchCategories = async (q) => {
  const { data } = await api.get("/api/categories/search", { params: { q } });
  return data;
};

export const getCategoryFull = async (id) => {
  const { data } = await api.get(`/api/categories/${id}/full`);
  return data.data;
};

export const getCoursesByCategory = async (categoryId) => {
  const { data } = await api.get(`/api/categories/${categoryId}/courses`);
  return data.data;
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post("/api/categories", categoryData);
  return data.data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/api/categories/${id}`);
  return data;
};
