import api from "../lib/api";

/**
 * Upload a small image (thumbnail / art) through the API to S3.
 * Returns both the public URL (for preview) and the S3 key (to persist).
 */
export const uploadImage = async (file, folder) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", folder);

  const { data } = await api.post("/api/upload/image", formData);

  return { url: data.data.url, key: data.data.key };
};
