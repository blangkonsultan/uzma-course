/**
 * Video helper utilities for extracting video IDs and constructing embed URLs
 * Supports YouTube and TikTok platforms
 */

export function extractVideoId(
  urlOrId: string,
  source: "youtube" | "tiktok"
): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();

  if (source === "youtube") {
    // 1. Direct 11-char video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    // 2. youtube.com/watch?v=XXXX
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vMatch) return vMatch[1];
    // 3. youtu.be/XXXX
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    // 4. youtube.com/embed/XXXX
    const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    // 5. youtube.com/shorts/XXXX
    const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
  }

  if (source === "tiktok") {
    // 1. Direct numeric video ID (usually 18-20 digits)
    if (/^\d{15,22}$/.test(trimmed)) {
      return trimmed;
    }
    // 2. tiktok.com/@username/video/7683120078589611285
    const videoMatch = trimmed.match(/\/video\/(\d{15,22})/);
    if (videoMatch) return videoMatch[1];
    // 3. tiktok.com/player/v1/7683120078589611285
    const playerMatch = trimmed.match(/\/player\/v1\/(\d{15,22})/);
    if (playerMatch) return playerMatch[1];
    // 4. tiktok.com/embed/v2/7683120078589611285 or /embed/7683120078589611285
    const embedMatch = trimmed.match(/\/embed\/(?:v\d+\/)?(\d{15,22})/);
    if (embedMatch) return embedMatch[1];
  }

  return trimmed;
}

export const VIDEO_PREFIXES = {
  tiktok: "https://www.tiktok.com/player/v1/",
  youtube: "https://www.youtube.com/embed/",
} as const;

export function buildEmbedUrl(
  idOrUrl: string,
  source: "youtube" | "tiktok"
): string {
  if (!idOrUrl) return "";
  const cleanId = extractVideoId(idOrUrl, source);
  if (!cleanId) return "";
  return `${VIDEO_PREFIXES[source]}${cleanId}`;
}
