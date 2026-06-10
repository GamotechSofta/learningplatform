import api from "../lib/api";

export const getUsers = async () => {
  const { data } = await api.get("/api/users");
  return data.data;
};

export const updateUser = async (id, userData) => {
  const { data } = await api.put(`/api/users/${id}`, userData);
  return data.data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/api/users/${id}`);
  return data;
};
