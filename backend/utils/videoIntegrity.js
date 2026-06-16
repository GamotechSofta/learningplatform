/**
 * Lightweight checks that an uploaded object looks like a real video file.
 * Catches empty/corrupt uploads (e.g. all 0xFF filler) before they reach users.
 */

const FTYP = Buffer.from("ftyp");
const WEBM_MAGIC = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
const MPEG_TS_PACKET = 188;

/** MPEG transport stream (.ts / .m2ts) — sync byte 0x47 every 188 bytes. */
const looksLikeMpegTs = (buffer) => {
  if (!buffer || buffer.length < MPEG_TS_PACKET) return false;

  const maxScan = Math.min(buffer.length - MPEG_TS_PACKET, 4096);
  for (let i = 0; i <= maxScan; i += 1) {
    if (buffer[i] !== 0x47) continue;

    let syncHits = 1;
    for (let packet = 1; packet < 3; packet += 1) {
      const offset = i + packet * MPEG_TS_PACKET;
      if (offset >= buffer.length) break;
      if (buffer[offset] === 0x47) syncHits += 1;
    }

    if (syncHits >= 2) return true;
  }

  return buffer[0] === 0x47;
};

export const looksLikeValidVideo = (buffer) => {
  if (!buffer || buffer.length < 12) return false;

  const allSame = buffer.every((byte) => byte === buffer[0]);
  if (allSame) return false;

  if (looksLikeMpegTs(buffer)) return true;
  if (buffer.subarray(4, 8).equals(FTYP)) return true;
  if (buffer.subarray(0, 4).equals(WEBM_MAGIC)) return true;

  const scanLength = Math.min(buffer.length, 64 * 1024);
  for (let i = 0; i <= scanLength - 4; i += 1) {
    if (buffer.subarray(i, i + 4).equals(FTYP)) return true;
  }

  return false;
};
