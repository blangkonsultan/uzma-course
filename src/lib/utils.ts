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
    /drive\.google\.com\/file\/(?:u\/[0-9]+\/)?d\/([a-zA-Z0-9_-]+)/
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
export function formatDuration(minutes: number | string): string {
  const n = typeof minutes === "string" ? parseInt(minutes, 10) : minutes;
  if (!n || isNaN(n) || n <= 0) return "-";
  if (n < 60) return `${n} menit`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
}

/** Format class ratio (max students per session) to human-readable Indonesian string */
export function formatClassRatio(studentsCount: number | string): string {
  const n = typeof studentsCount === "string" ? parseInt(studentsCount, 10) : studentsCount;
  if (!n || isNaN(n) || n <= 0) return "-";
  if (n === 1) return "Privat (1 on 1)";
  return `1 guru max ${n} murid`;
}

/** Format frequency (sessions per week) to human-readable Indonesian string with monthly estimate */
export function formatFrequency(sessionsPerWeek: number | string): string {
  const n = typeof sessionsPerWeek === "string" ? parseInt(sessionsPerWeek, 10) : sessionsPerWeek;
  if (!n || isNaN(n) || n <= 0) return "-";
  const monthly = n * 4;
  return `${n}x / minggu (${monthly}x / bulan)`;
}

/** Format frequency (sessions per week) short version */
export function formatFrequencyShort(sessionsPerWeek: number | string): string {
  const n = typeof sessionsPerWeek === "string" ? parseInt(sessionsPerWeek, 10) : sessionsPerWeek;
  if (!n || isNaN(n) || n <= 0) return "-";
  return `${n}x / minggu`;
}

export function formatTimeString(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  // Assumes HH:mm:ss format from PostgreSQL
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

export function formatDateString(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return dateStr;
  }
}
