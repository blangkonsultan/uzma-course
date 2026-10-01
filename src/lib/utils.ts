import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeImageUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();

  // Normalize existing Google Drive CDN links with trailing paths/params
  const lh3Match = trimmed.match(
    /(?:lh[0-9]*\.)?googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/
  );
  if (lh3Match) {
    return `https://lh3.googleusercontent.com/d/${lh3Match[1]}`;
  }

  // Convert Google Drive sharing links to direct CDN embed URLs
  const fileDMatch = trimmed.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  );
  if (fileDMatch) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  const openIdMatch = trimmed.match(
    /drive\.google\.com\/open\?(?:.*&)?id=([a-zA-Z0-9_-]+)/
  );
  if (openIdMatch) {
    return `https://lh3.googleusercontent.com/d/${openIdMatch[1]}`;
  }

  const ucMatch = trimmed.match(
    /drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/
  );
  if (ucMatch) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  }

  return trimmed;
}

/** Format duration in minutes to human-readable Indonesian string */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "-";
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
}
