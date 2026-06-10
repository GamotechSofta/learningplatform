import api from "../lib/api";

export const uploadImage = async (file, folder) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", folder);

  const { data } = await api.post("/api/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.data.url;
};
