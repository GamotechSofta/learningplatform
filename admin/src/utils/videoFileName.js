const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".avi",
  ".mkv",
  ".m4v",
  ".mpeg",
  ".mpg",
  ".ts",
  ".m2ts",
]);

const VIDEO_MIME_BY_EXT = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".m4v": "video/x-m4v",
  ".mpeg": "video/mpeg",
  ".mpg": "video/mpeg",
  ".ts": "video/mp2t",
  ".m2ts": "video/mp2t",
};

export const fileExtension = (fileName) => {
  const dot = String(fileName || "").lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
};

export const resolveVideoContentType = (file) => {
  if (file?.type?.startsWith("video/")) return file.type;
  const ext = fileExtension(file?.name);
  return VIDEO_MIME_BY_EXT[ext] || "video/mp4";
};

export const videoMimeFromUrl = (url) => {
  const path = String(url || "").split("?")[0].toLowerCase();
  if (path.endsWith(".ts") || path.endsWith(".m2ts")) return "video/mp2t";
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mov")) return "video/quicktime";
  if (path.endsWith(".mkv")) return "video/x-matroska";
  if (path.endsWith(".avi")) return "video/x-msvideo";
  return "video/mp4";
};

export const VIDEO_ACCEPT =
  "video/*,.mp4,.webm,.mov,.avi,.mkv,.m4v,.mpeg,.mpg,.ts,.m2ts";

export const isTsVideoUrl = (url) => /\.m2?ts($|\?)/i.test(String(url || ""));

export const isVideoFile = (file) => {
  if (!file?.name) return false;
  const ext = fileExtension(file.name);
  return VIDEO_EXTENSIONS.has(ext) || file.type?.startsWith("video/");
};

/** Derive a readable video title from a file name. */
export const titleFromFileName = (fileName) => {
  const base = String(fileName || "").replace(/\.[^.]+$/, "");
  return base
    .replace(/\s*__\s*/g, " – ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const sortVideoFiles = (files) =>
  [...files].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
  );

export const filterAndSortVideoFiles = (fileList) =>
  sortVideoFiles([...fileList].filter(isVideoFile));
