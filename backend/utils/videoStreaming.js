import { transcodeVideoToHls } from "./hlsTranscode.js";

const activeJobs = new Set();

/** Off by default — set ENABLE_HLS_TRANSCODE=true to run ffmpeg jobs on the server. */
export const isHlsTranscodeEnabled = () =>
  String(process.env.ENABLE_HLS_TRANSCODE || "").toLowerCase() === "true";

/**
 * Optional adaptive HLS job. Disabled unless ENABLE_HLS_TRANSCODE=true.
 */
export const queueVideoStreamingJob = (videoId) => {
  if (!isHlsTranscodeEnabled()) return;

  const id = videoId?.toString();
  if (!id || activeJobs.has(id)) return;

  activeJobs.add(id);
  setImmediate(async () => {
    try {
      await transcodeVideoToHls(id);
    } catch {
      // Errors are logged inside transcodeVideoToHls.
    } finally {
      activeJobs.delete(id);
    }
  });
};
