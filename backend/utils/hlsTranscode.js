import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

import Video from "../models/video.js";
import {
  deleteObjectsByPrefix,
  downloadObjectToFile,
  uploadDirectoryToS3,
  uploadLocalFileToS3,
} from "./s3.js";

const FFMPEG_BIN = process.env.FFMPEG_PATH?.trim() || "ffmpeg";

const runCommand = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) resolve(stderr);
      else reject(new Error(stderr || `${command} exited with code ${code}`));
    });
  });

const ffmpegAvailable = async () => {
  try {
    await runCommand(FFMPEG_BIN, ["-version"]);
    return true;
  } catch {
    return false;
  }
};

const optimizeMp4FastStart = async (inputPath, outputPath) => {
  await runCommand(FFMPEG_BIN, [
    "-y",
    "-i",
    inputPath,
    "-c",
    "copy",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
};

/**
 * Build adaptive HLS (480p + 720p) so the player can switch quality by bandwidth.
 */
const buildAdaptiveHls = async (inputPath, outputDir) => {
  fs.mkdirSync(path.join(outputDir, "v0"), { recursive: true });
  fs.mkdirSync(path.join(outputDir, "v1"), { recursive: true });

  await runCommand(FFMPEG_BIN, [
    "-y",
    "-i",
    inputPath,
    "-preset",
    "veryfast",
    "-sc_threshold",
    "0",
    "-g",
    "48",
    "-keyint_min",
    "48",
    "-map",
    "0:v:0",
    "-map",
    "0:a:0",
    "-map",
    "0:v:0",
    "-map",
    "0:a:0",
    "-c:v:0",
    "libx264",
    "-b:v:0",
    "800k",
    "-maxrate:v:0",
    "856k",
    "-bufsize:v:0",
    "1200k",
    "-s:v:0",
    "854x480",
    "-c:a:0",
    "aac",
    "-b:a:0",
    "96k",
    "-c:v:1",
    "libx264",
    "-b:v:1",
    "2500k",
    "-maxrate:v:1",
    "2670k",
    "-bufsize:v:1",
    "3750k",
    "-s:v:1",
    "1280x720",
    "-c:a:1",
    "aac",
    "-b:a:1",
    "128k",
    "-var_stream_map",
    "v:0,a:0 v:1,a:1",
    "-master_pl_name",
    "master.m3u8",
    "-f",
    "hls",
    "-hls_time",
    "6",
    "-hls_list_size",
    "0",
    "-hls_segment_filename",
    path.join(outputDir, "v%v", "seg%03d.ts"),
    path.join(outputDir, "v%v", "playlist.m3u8"),
  ]);
};

const buildHlsPrefix = (videoKey) => {
  const base = path.basename(videoKey, path.extname(videoKey));
  return `hls/${base}`;
};

export const transcodeVideoToHls = async (videoId) => {
  const video = await Video.findById(videoId);
  if (!video?.videoKey) {
    if (video) {
      video.streamingStatus = "skipped";
      await video.save();
    }
    return null;
  }

  if (video.streamingStatus === "ready" && video.hlsKey) {
    return video.hlsKey;
  }

  if (!(await ffmpegAvailable())) {
    video.streamingStatus = "skipped";
    await video.save();
    console.warn(
      `[hls] ffmpeg not found — skipping adaptive stream for video ${videoId}`
    );
    return null;
  }

  video.streamingStatus = "processing";
  await video.save();

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "vidyank-hls-"));
  const inputPath = path.join(workDir, "source.mp4");
  const fastStartPath = path.join(workDir, "faststart.mp4");
  const hlsDir = path.join(workDir, "hls");
  const hlsPrefix = buildHlsPrefix(video.videoKey);

  try {
    await downloadObjectToFile(video.videoKey, inputPath);
    await optimizeMp4FastStart(inputPath, fastStartPath);
    await uploadLocalFileToS3(fastStartPath, video.videoKey, "video/mp4");
    fs.mkdirSync(hlsDir, { recursive: true });
    await buildAdaptiveHls(fastStartPath, hlsDir);

    if (video.hlsKey) {
      const oldPrefix = video.hlsKey.replace(/\/master\.m3u8$/i, "");
      await deleteObjectsByPrefix(oldPrefix);
    } else {
      await deleteObjectsByPrefix(hlsPrefix);
    }

    await uploadDirectoryToS3(hlsDir, hlsPrefix);

    const masterKey = `${hlsPrefix}/master.m3u8`;
    video.hlsKey = masterKey;
    video.streamingStatus = "ready";
    await video.save();

    console.log(`[hls] ready for video ${videoId} → ${masterKey}`);
    return masterKey;
  } catch (error) {
    video.streamingStatus = "failed";
    await video.save();
    console.error(`[hls] failed for video ${videoId}:`, error.message);
    throw error;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
};
