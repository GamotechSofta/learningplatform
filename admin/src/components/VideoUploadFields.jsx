import ImageUpload from "./ImageUpload";
import UploadProgress from "./UploadProgress";

const defaultForm = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnail: "",
  duration: "",
  uploadMode: "file",
  isPublished: false,
};

export const getDefaultVideoForm = () => ({ ...defaultForm });

export default function VideoUploadFields({
  form,
  videoFile,
  disabled = false,
  uploadProgress = null,
  onFormChange,
  onFileChange,
}) {
  const uploadMode = form.uploadMode || "file";

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onFormChange({ uploadMode: "file" })}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            uploadMode === "file"
              ? "bg-slate-800 text-white"
              : "border border-slate-300 text-slate-600"
          }`}
        >
          Upload from Device
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onFormChange({ uploadMode: "url" })}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            uploadMode === "url"
              ? "bg-slate-800 text-white"
              : "border border-slate-300 text-slate-600"
          }`}
        >
          Video URL
        </button>
      </div>

      <input
        type="text"
        required
        disabled={disabled}
        placeholder="Video title"
        value={form.title}
        onChange={(e) => onFormChange({ title: e.target.value })}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
      />

      <textarea
        rows={2}
        disabled={disabled}
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => onFormChange({ description: e.target.value })}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
      />

      {uploadMode === "file" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Video File</label>
          <input
            type="file"
            accept="video/*"
            disabled={disabled}
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:text-blue-700 disabled:bg-slate-50"
          />
          {videoFile && (
            <p className="mt-1 text-xs text-slate-500">
              Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}
          <UploadProgress progress={uploadProgress} />
        </div>
      ) : (
        <input
          type="url"
          required
          disabled={disabled}
          placeholder="https://..."
          value={form.videoUrl}
          onChange={(e) => onFormChange({ videoUrl: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <ImageUpload
          folder="videos"
          label="Thumbnail (optional)"
          disabled={disabled}
          value={form.thumbnail}
          onChange={(url) => onFormChange({ thumbnail: url })}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Duration (seconds)</label>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={form.duration}
            onChange={(e) => onFormChange({ duration: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          disabled={disabled}
          checked={form.isPublished}
          onChange={(e) => onFormChange({ isPublished: e.target.checked })}
        />
        Publish video
      </label>
    </div>
  );
}
