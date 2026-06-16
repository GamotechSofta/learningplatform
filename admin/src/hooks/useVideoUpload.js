import { useCallback, useEffect, useRef, useState } from "react";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  initMultipartUpload,
  presignPart,
} from "../services/videoService";
import { resolveVideoContentType } from "../utils/videoFileName";

const MAX_PART_RETRIES = 3;
const DEFAULT_CONCURRENCY = 3;

const CORS_HINT =
  "Upload blocked by S3. Configure bucket CORS to allow PUT from this domain and expose the ETag header.";

const initialState = {
  status: "idle", // idle | preparing | uploading | paused | completing | completed | error | canceled
  progress: 0,
  uploadedBytes: 0,
  totalBytes: 0,
  speed: 0, // bytes / second
  eta: null, // seconds remaining
  error: null,
};

/**
 * Direct browser -> S3 multipart upload with progress, speed, ETA, and
 * pause / resume / retry / cancel controls. The file never passes through the
 * backend — only presigned-URL requests do.
 *
 * Usage:
 *   const upload = useVideoUpload();
 *   const { videoKey, size } = await upload.start(file);
 */
export default function useVideoUpload({ concurrency = DEFAULT_CONCURRENCY } = {}) {
  const [state, setState] = useState(initialState);

  // Mutable upload context (kept in refs so async workers never read stale state).
  const fileRef = useRef(null);
  const sessionRef = useRef(null); // { uploadId, key, partSize }
  const partsRef = useRef([]); // [{ partNumber, start, end, size, status, loaded, etag }]
  const inFlightRef = useRef(0);
  const pausedRef = useRef(false);
  const canceledRef = useRef(false);
  const finalizingRef = useRef(false);
  const settleRef = useRef({ resolve: null, reject: null });
  const speedSampleRef = useRef({ time: 0, bytes: 0, ema: 0 });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const patch = useCallback((updates) => {
    if (mountedRef.current) setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const totalUploadedBytes = useCallback(
    () => partsRef.current.reduce((sum, p) => sum + (p.loaded || 0), 0),
    []
  );

  const reportProgress = useCallback(() => {
    const total = fileRef.current?.size || 0;
    const uploaded = totalUploadedBytes();
    patch({
      uploadedBytes: uploaded,
      totalBytes: total,
      progress: total ? Math.min(99, Math.round((uploaded / total) * 100)) : 0,
    });
  }, [patch, totalUploadedBytes]);

  /* ------------------------ speed + ETA estimation ------------------------ */
  useEffect(() => {
    if (state.status !== "uploading") return undefined;

    speedSampleRef.current = {
      time: Date.now(),
      bytes: totalUploadedBytes(),
      ema: speedSampleRef.current.ema || 0,
    };

    const interval = setInterval(() => {
      const now = Date.now();
      const bytes = totalUploadedBytes();
      const last = speedSampleRef.current;
      const dt = (now - last.time) / 1000;
      if (dt <= 0) return;

      const instant = Math.max(0, (bytes - last.bytes) / dt);
      // Exponential moving average smooths out chunk-boundary spikes.
      const ema = last.ema ? last.ema * 0.7 + instant * 0.3 : instant;
      speedSampleRef.current = { time: now, bytes, ema };

      const total = fileRef.current?.size || 0;
      const remaining = Math.max(0, total - bytes);
      const eta = ema > 0 ? Math.round(remaining / ema) : null;

      patch({ speed: ema, eta });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, patch, totalUploadedBytes]);

  /* ----------------------------- part upload ------------------------------ */
  const uploadPart = useCallback(
    async (part) => {
      const { uploadId, key } = sessionRef.current;
      const file = fileRef.current;
      const blob = file.slice(part.start, part.end);

      let url;
      try {
        url = await presignPart({ uploadId, key, partNumber: part.partNumber });
      } catch (err) {
        part.attempts = (part.attempts || 0) + 1;
        part.status = part.attempts >= MAX_PART_RETRIES ? "failed" : "pending";
        if (part.status === "failed") {
          part.errorMessage =
            err?.response?.data?.message || "Could not get an upload URL for a chunk.";
        }
        return;
      }

      await new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        part.xhr = xhr;
        xhr.open("PUT", url);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            part.loaded = event.loaded;
            reportProgress();
          }
        };

        xhr.onload = () => {
          part.xhr = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            const etag = xhr.getResponseHeader("ETag");
            if (!etag) {
              // 2xx but no ETag => CORS isn't exposing it; retrying won't help.
              part.status = "failed";
              part.loaded = 0;
              part.errorMessage = CORS_HINT;
              resolve();
              return;
            }
            part.etag = etag;
            part.loaded = part.size;
            part.status = "done";
            reportProgress();
          } else {
            part.attempts = (part.attempts || 0) + 1;
            part.loaded = 0;
            part.status = part.attempts >= MAX_PART_RETRIES ? "failed" : "pending";
            if (part.status === "failed") {
              part.errorMessage = `S3 rejected a chunk (HTTP ${xhr.status}).`;
            }
          }
          resolve();
        };

        xhr.onerror = () => {
          part.xhr = null;
          part.attempts = (part.attempts || 0) + 1;
          part.loaded = 0;
          // A network-level failure here is almost always missing S3 CORS.
          part.status = part.attempts >= MAX_PART_RETRIES ? "failed" : "pending";
          if (part.status === "failed") part.errorMessage = CORS_HINT;
          resolve();
        };

        xhr.onabort = () => {
          part.xhr = null;
          part.loaded = 0;
          // Aborted by pause/cancel — leave as pending so it can resume.
          if (part.status === "uploading") part.status = "pending";
          resolve();
        };

        xhr.send(blob);
      });
    },
    [reportProgress]
  );

  /* ------------------------------ finalize -------------------------------- */
  const finalize = useCallback(async () => {
    if (finalizingRef.current) return;
    finalizingRef.current = true;

    const { uploadId, key } = sessionRef.current;
    patch({ status: "completing" });

    try {
      const parts = partsRef.current.map((p) => ({
        PartNumber: p.partNumber,
        ETag: p.etag,
      }));
      const { videoKey } = await completeMultipartUpload({ uploadId, key, parts });

      patch({ status: "completed", progress: 100, eta: 0, speed: 0 });
      settleRef.current.resolve?.({ videoKey, size: fileRef.current?.size || 0 });
    } catch (err) {
      finalizingRef.current = false;
      const message = err?.response?.data?.message || "Failed to finalize the upload.";
      patch({ status: "error", error: message });
    }
  }, [patch]);

  /* ------------------------------ scheduler ------------------------------- */
  const pump = useCallback(() => {
    if (canceledRef.current || pausedRef.current) return;

    const parts = partsRef.current;

    const permanentlyFailed = parts.find((p) => p.status === "failed");
    if (permanentlyFailed) {
      if (inFlightRef.current === 0) {
        patch({
          status: "error",
          error: permanentlyFailed.errorMessage || "A chunk failed to upload.",
        });
      }
      return;
    }

    if (parts.every((p) => p.status === "done")) {
      if (inFlightRef.current === 0) finalize();
      return;
    }

    while (inFlightRef.current < concurrency) {
      const next = parts.find((p) => p.status === "pending");
      if (!next) break;
      next.status = "uploading";
      inFlightRef.current += 1;
      uploadPart(next).finally(() => {
        inFlightRef.current -= 1;
        pump();
      });
    }
  }, [concurrency, finalize, patch, uploadPart]);

  /* -------------------------------- start --------------------------------- */
  const start = useCallback(
    (file) => {
      if (!file) return Promise.reject(new Error("No file provided"));

      // Reset everything for a fresh upload.
      fileRef.current = file;
      partsRef.current = [];
      inFlightRef.current = 0;
      pausedRef.current = false;
      canceledRef.current = false;
      finalizingRef.current = false;
      speedSampleRef.current = { time: 0, bytes: 0, ema: 0 };

      setState({
        ...initialState,
        status: "preparing",
        totalBytes: file.size,
      });

      return new Promise((resolve, reject) => {
        settleRef.current = { resolve, reject };

        initMultipartUpload({
          fileName: file.name,
          contentType: resolveVideoContentType(file),
          fileSize: file.size,
        })
          .then(({ uploadId, key, partSize }) => {
            if (canceledRef.current) return;

            sessionRef.current = { uploadId, key, partSize };

            const total = file.size;
            const count = Math.max(1, Math.ceil(total / partSize));
            partsRef.current = Array.from({ length: count }, (_, i) => {
              const start = i * partSize;
              const end = Math.min(start + partSize, total);
              return {
                partNumber: i + 1,
                start,
                end,
                size: end - start,
                loaded: 0,
                status: "pending",
                attempts: 0,
                etag: null,
                xhr: null,
              };
            });

            patch({ status: "uploading" });
            pump();
          })
          .catch((err) => {
            const message =
              err?.response?.data?.message || "Failed to start the upload.";
            patch({ status: "error", error: message });
            reject(err);
          });
      });
    },
    [patch, pump]
  );

  /* ------------------------------- controls ------------------------------- */
  const pause = useCallback(() => {
    if (state.status !== "uploading") return;
    pausedRef.current = true;
    partsRef.current.forEach((p) => p.xhr?.abort());
    patch({ status: "paused", speed: 0, eta: null });
  }, [patch, state.status]);

  const resume = useCallback(() => {
    if (state.status !== "paused") return;
    pausedRef.current = false;
    patch({ status: "uploading" });
    pump();
  }, [patch, pump, state.status]);

  const retry = useCallback(() => {
    if (state.status !== "error") return;
    // Reset only the parts that didn't finish, then continue.
    partsRef.current.forEach((p) => {
      if (p.status !== "done") {
        p.status = "pending";
        p.attempts = 0;
        p.loaded = 0;
        p.errorMessage = null;
      }
    });
    pausedRef.current = false;
    canceledRef.current = false;
    finalizingRef.current = false;
    patch({ status: "uploading", error: null });
    pump();
  }, [patch, pump, state.status]);

  const cancel = useCallback(async () => {
    canceledRef.current = true;
    pausedRef.current = false;
    partsRef.current.forEach((p) => p.xhr?.abort());

    if (sessionRef.current?.uploadId) {
      await abortMultipartUpload({
        uploadId: sessionRef.current.uploadId,
        key: sessionRef.current.key,
      });
    }

    patch({ status: "canceled", speed: 0, eta: null });
    settleRef.current.reject?.(new Error("Upload canceled"));
  }, [patch]);

  const reset = useCallback(() => {
    fileRef.current = null;
    sessionRef.current = null;
    partsRef.current = [];
    inFlightRef.current = 0;
    pausedRef.current = false;
    canceledRef.current = false;
    finalizingRef.current = false;
    settleRef.current = { resolve: null, reject: null };
    setState(initialState);
  }, []);

  return {
    ...state,
    isActive: ["preparing", "uploading", "paused", "completing"].includes(state.status),
    start,
    pause,
    resume,
    retry,
    cancel,
    reset,
  };
}
