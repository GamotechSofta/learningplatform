import { getPublicUrl } from "./s3.js";

/**
 * Normalize stored thumbnail/image values to a public CDN URL.
 */
export const resolveMediaUrl = (value) => {
  if (!value) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    if (/\.amazonaws\.com\//i.test(raw)) {
      try {
        const pathname = new URL(raw).pathname.replace(/^\/+/, "");
        return getPublicUrl(pathname);
      } catch {
        return raw;
      }
    }
    return raw;
  }

  return getPublicUrl(raw);
};

export const withResolvedThumbnail = (doc) => {
  if (!doc) return doc;
  const output = doc?.toObject ? doc.toObject() : { ...doc };
  if (output.thumbnail) {
    output.thumbnail = resolveMediaUrl(output.thumbnail);
  }
  return output;
};
