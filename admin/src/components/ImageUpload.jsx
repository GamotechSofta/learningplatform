import { useRef, useState } from "react";
import { uploadImage } from "../services/uploadService";

export default function ImageUpload({
  folder,
  value,
  onChange,
  label = "Image",
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const { url, key } = await uploadImage(file, folder);
      onChange(url, key);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={disabled || uploading}
          onChange={handleFile}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:text-blue-700 disabled:bg-slate-50"
        />
        {uploading && <span className="text-xs text-slate-500">Uploading...</span>}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {value && (
        <img
          src={value}
          alt="Preview"
          className="mt-2 h-32 w-full max-w-xs rounded-lg border border-slate-200 object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}
