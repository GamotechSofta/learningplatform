import { useRef, useState } from "react";
import UploadCompleteModal from "./UploadCompleteModal";
import useVideoUpload from "../hooks/useVideoUpload";
import { createVideo } from "../services/videoService";
import {
  filterAndSortVideoFiles,
  titleFromFileName,
} from "../utils/videoFileName";

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

const statusLabel = {
  pending: "Pending",
  uploading: "Uploading",
  saving: "Saving",
  done: "Done",
  error: "Failed",
  skipped: "Skipped",
};

/**
 * Upload many videos at once (multi-select or a folder). Titles are taken from
 * file names and can be edited before upload starts.
 */
export default function BulkVideoUploadPanel({
  lessonId,
  order = 0,
  disabled = false,
  onCreated,
}) {
  const [queue, setQueue] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [completeMessage, setCompleteMessage] = useState("");
  const filesInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const cancelRef = useRef(false);

  const upload = useVideoUpload();

  const addFiles = (fileList) => {
    const videos = filterAndSortVideoFiles(fileList);
    if (!videos.length) {
      setError("No video files found. Supported: MP4, WebM, MOV, AVI, MKV, M4V.");
      return;
    }

    setError("");
    setQueue((prev) => {
      const existing = new Set(prev.map((item) => `${item.file.name}-${item.file.size}`));
      const next = videos
        .filter((file) => !existing.has(`${file.name}-${file.size}`))
        .map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
          title: titleFromFileName(file.name),
          status: "pending",
          error: "",
        }));
      return [...prev, ...next];
    });
  };

  const updateTitle = (id, title) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title } : item))
    );
  };

  const removeItem = (id) => {
    if (running) return;
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearQueue = () => {
    if (running) return;
    setQueue([]);
    setError("");
    if (filesInputRef.current) filesInputRef.current.value = "";
    if (folderInputRef.current) folderInputRef.current.value = "";
  };

  const setItemStatus = (id, patch) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleUploadAll = async () => {
    if (!lessonId || running || queue.length === 0) return;

    const pending = queue.filter((item) => item.status === "pending" || item.status === "error");
    if (!pending.length) {
      setError("No pending videos to upload.");
      return;
    }

    const missingTitle = pending.find((item) => !item.title.trim());
    if (missingTitle) {
      setError("Every video needs a title before upload.");
      return;
    }

    setError("");
    setRunning(true);
    cancelRef.current = false;

    let nextOrder = order;
    let uploadedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < queue.length; i++) {
      if (cancelRef.current) break;

      const item = queue[i];
      if (item.status === "done") continue;

      setCurrentIndex(i);
      setItemStatus(item.id, { status: "uploading", error: "" });

      try {
        upload.reset();
        const { videoKey, size } = await upload.start(item.file);

        if (cancelRef.current) break;

        setItemStatus(item.id, { status: "saving" });

        await createVideo({
          lesson: lessonId,
          title: item.title.trim(),
          videoKey,
          size,
          order: nextOrder,
          isPublished,
        });

        nextOrder += 1;
        uploadedCount += 1;
        setItemStatus(item.id, { status: "done", error: "" });
      } catch (err) {
        if (err?.message === "Upload canceled") {
          setItemStatus(item.id, { status: "pending", error: "" });
          break;
        }
        failedCount += 1;
        setItemStatus(item.id, {
          status: "error",
          error: err?.response?.data?.message || err?.message || "Upload failed",
        });
      } finally {
        upload.reset();
      }
    }

    setRunning(false);
    setCurrentIndex(-1);

    if (uploadedCount > 0) {
      onCreated?.();
      const summary =
        failedCount > 0
          ? `${uploadedCount} video(s) uploaded successfully. ${failedCount} failed.`
          : `${uploadedCount} video(s) uploaded successfully.`;
      setCompleteMessage(summary);
    }
  };

  const handleCancel = async () => {
    cancelRef.current = true;
    if (upload.isActive) await upload.cancel();
    setRunning(false);
    setCurrentIndex(-1);
  };

  const doneCount = queue.filter((item) => item.status === "done").length;
  const showProgress = upload.isActive || upload.status === "error";

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-800">Bulk upload</p>
        <p className="mt-1 text-xs text-slate-500">
          Select multiple video files or an entire folder. Titles are filled from file names automatically.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || running}
            onClick={() => filesInputRef.current?.click()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            Select Videos
          </button>
          <button
            type="button"
            disabled={disabled || running}
            onClick={() => folderInputRef.current?.click()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Select Folder
          </button>
          {queue.length > 0 && (
            <button
              type="button"
              disabled={running}
              onClick={clearQueue}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            >
              Clear list
            </button>
          )}
        </div>
        <input
          ref={filesInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          disabled={disabled || running}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          disabled={disabled || running}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          // Non-standard but widely supported for folder selection.
          webkitDirectory
        />
      </div>

      {queue.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
            <p className="text-sm font-medium text-slate-800">
              {queue.length} video(s) · {doneCount} uploaded
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                disabled={disabled || running}
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publish all
            </label>
          </div>
          <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {queue.map((item, index) => (
              <div
                key={item.id}
                className={`grid gap-3 px-4 py-3 sm:grid-cols-[auto_1fr_auto] ${
                  currentIndex === index ? "bg-blue-50" : ""
                }`}
              >
                <span className="pt-2 text-xs text-slate-400">#{index + 1}</span>
                <div className="min-w-0 space-y-1">
                  <input
                    type="text"
                    value={item.title}
                    disabled={running || item.status === "done"}
                    onChange={(e) => updateTitle(item.id, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:bg-slate-50"
                  />
                  <p className="truncate text-xs text-slate-500">
                    {item.file.name} · {formatBytes(item.file.size)}
                  </p>
                  {item.error && (
                    <p className="text-xs text-red-600">{item.error}</p>
                  )}
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      item.status === "done"
                        ? "bg-green-100 text-green-700"
                        : item.status === "error"
                          ? "bg-red-100 text-red-700"
                          : item.status === "uploading" || item.status === "saving"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {statusLabel[item.status] || item.status}
                  </span>
                  {!running && item.status !== "done" && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showProgress && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-1 flex justify-between text-xs text-slate-600">
            <span>
              {upload.status === "preparing" && "Preparing upload..."}
              {upload.status === "uploading" && "Uploading current file to S3..."}
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
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>
              {formatBytes(upload.uploadedBytes)} / {formatBytes(upload.totalBytes)}
            </span>
            <span>Speed: {formatSpeed(upload.speed)}</span>
            <span>ETA: {formatEta(upload.eta)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || running || queue.length === 0}
          onClick={handleUploadAll}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {running ? `Uploading (${doneCount}/${queue.length})...` : `Upload ${queue.length} Video(s)`}
        </button>
        {running && (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Cancel
          </button>
        )}
      </div>

      <UploadCompleteModal
        open={Boolean(completeMessage)}
        title="Upload completed"
        message={completeMessage}
        onClose={() => setCompleteMessage("")}
      />
    </div>
  );
}
