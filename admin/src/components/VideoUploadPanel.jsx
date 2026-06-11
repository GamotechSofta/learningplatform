import { useRef, useState } from "react";
import ImageUpload from "./ImageUpload";
import useVideoUpload from "../hooks/useVideoUpload";
import { createVideo } from "../services/videoService";
import { titleFromFileName } from "../utils/videoFileName";

const emptyForm = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnail: "",
  thumbnailKey: "",
  duration: "",
  isPublished: false,
};

const formatBytes = (bytes) => {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
};

const formatSpeed = (bytesPerSec) => {
  if (!bytesPerSec) return "—";
  return `${formatBytes(bytesPerSec)}/s`;
};

const formatEta = (seconds) => {
  if (seconds == null || !Number.isFinite(seconds)) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

/**
 * Full "add a video" flow for one lesson:
 *  - device upload  -> direct browser-to-S3 multipart (with progress controls)
 *  - external URL   -> stored as externalUrl
 * then persists metadata via POST /api/videos.
 */
export default function VideoUploadPanel({ lessonId, order = 0, disabled = false, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("file"); // 'file' | 'url'
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const upload = useVideoUpload();

  const updateForm = (updates) => setForm((prev) => ({ ...prev, ...updates }));

  const resetAll = () => {
    setForm(emptyForm);
    setFile(null);
    setMode("file");
    upload.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lessonId || saving) return;

    setError("");
    if (!form.title.trim()) {
      setError("Video title is required");
      return;
    }

    setSaving(true);
    try {
      if (mode === "file") {
        if (!file) {
          setError("Select a video file from your device");
          setSaving(false);
          return;
        }

        // Uploads directly to S3; resolves with the stored object key.
        const { videoKey, size } = await upload.start(file);

        await createVideo({
          lesson: lessonId,
          title: form.title,
          description: form.description || undefined,
          videoKey,
          thumbnailKey: form.thumbnailKey || undefined,
          duration: Math.round((Number(form.duration) || 0) * 60),
          size,
          order,
          isPublished: form.isPublished,
        });
      } else {
        if (!form.videoUrl.trim()) {
          setError("Enter a video URL");
          setSaving(false);
          return;
        }

        await createVideo({
          lesson: lessonId,
          title: form.title,
          description: form.description || undefined,
          externalUrl: form.videoUrl,
          thumbnailKey: form.thumbnailKey || undefined,
          duration: Math.round((Number(form.duration) || 0) * 60),
          order,
          isPublished: form.isPublished,
        });
      }

      resetAll();
      onCreated?.();
    } catch (err) {
      if (err?.message !== "Upload canceled") {
        setError(err?.response?.data?.message || err?.message || "Failed to add video");
      }
    } finally {
      setSaving(false);
    }
  };

  const showProgress = upload.isActive || upload.status === "error";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || upload.isActive}
          onClick={() => setMode("file")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            mode === "file" ? "bg-slate-800 text-white" : "border border-slate-300 text-slate-600"
          }`}
        >
          Upload from Device
        </button>
        <button
          type="button"
          disabled={disabled || upload.isActive}
          onClick={() => setMode("url")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            mode === "url" ? "bg-slate-800 text-white" : "border border-slate-300 text-slate-600"
          }`}
        >
          Video URL
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Video Title</label>
          <input
            type="text"
            required
            disabled={disabled}
            placeholder="Video title"
            value={form.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Duration (minutes)</label>
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            disabled={disabled}
            value={form.duration}
            onChange={(e) => updateForm({ duration: e.target.value })}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            rows={2}
            disabled={disabled}
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
        </div>
        {mode === "file" ? (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Video File (up to 5GB)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              disabled={disabled || upload.isActive}
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                setFile(selected);
                if (selected && !form.title.trim()) {
                  updateForm({ title: titleFromFileName(selected.name) });
                }
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:text-blue-700 disabled:bg-slate-50"
            />
            {file && !showProgress && (
              <p className="mt-1 text-xs text-slate-500">
                Selected: {file.name} ({formatBytes(file.size)})
              </p>
            )}
          </div>
        ) : (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Video URL</label>
            <input
              type="url"
              required
              disabled={disabled}
              placeholder="https://..."
              value={form.videoUrl}
              onChange={(e) => updateForm({ videoUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
        )}
      </div>

      {showProgress && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-1 flex justify-between text-xs text-slate-600">
            <span>
              {upload.status === "preparing" && "Preparing upload..."}
              {upload.status === "uploading" && "Uploading to S3..."}
              {upload.status === "paused" && "Paused"}
              {upload.status === "completing" && "Finalizing..."}
              {upload.status === "error" && "Upload error"}
            </span>
            <span>{upload.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                upload.status === "error" ? "bg-red-500" : "bg-blue-600"
              }`}
              style={{ width: `${upload.progress}%` }}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {formatBytes(upload.uploadedBytes)} / {formatBytes(upload.totalBytes)}
            </span>
            <span>Speed: {formatSpeed(upload.speed)}</span>
            <span>ETA: {formatEta(upload.eta)}</span>
          </div>

          {upload.status === "error" && upload.error && (
            <p className="mt-2 text-xs text-red-600">{upload.error}</p>
          )}

          <div className="mt-3 flex gap-2">
            {upload.status === "uploading" && (
              <button
                type="button"
                onClick={upload.pause}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
              >
                Pause
              </button>
            )}
            {upload.status === "paused" && (
              <button
                type="button"
                onClick={upload.resume}
                className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
              >
                Resume
              </button>
            )}
            {upload.status === "error" && (
              <button
                type="button"
                onClick={upload.retry}
                className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
              >
                Retry
              </button>
            )}
            {upload.isActive || upload.status === "error" ? (
              <button
                type="button"
                onClick={upload.cancel}
                className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImageUpload
          folder="videos"
          label="Thumbnail (optional)"
          disabled={disabled || upload.isActive}
          value={form.thumbnail}
          onChange={(url, key) => updateForm({ thumbnail: url, thumbnailKey: key })}
        />
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              disabled={disabled}
              checked={form.isPublished}
              onChange={(e) => updateForm({ isPublished: e.target.checked })}
            />
            Publish video
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || saving}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
      >
        {saving ? "Working..." : "Add Video"}
      </button>
    </form>
  );
}
