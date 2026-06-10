import api from "../lib/api";

export const login = async (email, password) => {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data.data;
};

export const logout = async () => {
  const { data } = await api.post("/api/auth/logout");
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/api/auth/me");
  return data.data;
};
