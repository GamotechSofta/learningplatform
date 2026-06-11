const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".webm",
  ".mov",
  ".avi",
  ".mkv",
  ".m4v",
  ".mpeg",
  ".mpg",
]);

export const isVideoFile = (file) => {
  if (!file?.name) return false;
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
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
