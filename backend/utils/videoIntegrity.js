/**
 * Lightweight checks that an uploaded object looks like a real video file.
 * Catches empty/corrupt uploads (e.g. all 0xFF filler) before they reach users.
 */

const FTYP = Buffer.from("ftyp");
const WEBM_MAGIC = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

export const looksLikeValidVideo = (buffer) => {
  if (!buffer || buffer.length < 12) return false;

  const allSame = buffer.every((byte) => byte === buffer[0]);
  if (allSame) return false;

  if (buffer.subarray(4, 8).equals(FTYP)) return true;
  if (buffer.subarray(0, 4).equals(WEBM_MAGIC)) return true;

  const scanLength = Math.min(buffer.length, 64 * 1024);
  for (let i = 0; i <= scanLength - 4; i += 1) {
    if (buffer.subarray(i, i + 4).equals(FTYP)) return true;
  }

  return false;
};
