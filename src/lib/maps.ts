"use server";

import { requireAdminAction } from "@/lib/auth";

const ALLOWED_MAP_HOSTS: Record<string, true> = {
  "maps.google.com": true,
  "www.google.com": true,
  "google.com": true,
  "maps.app.goo.gl": true,
  "goo.gl": true,
};

export async function extractCoordinatesFromUrl(rawUrl: string) {
  // Authorize caller - let auth errors throw cleanly to caller
  await requireAdminAction();

  if (!rawUrl || typeof rawUrl !== "string") {
    return { error: "URL tidak valid." };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { error: "Format URL tidak valid." };
  }

  if (parsed.protocol !== "https:") {
    return { error: "Hanya tautan HTTPS yang diperbolehkan." };
  }

  if (!ALLOWED_MAP_HOSTS[parsed.hostname.toLowerCase()]) {
    return { error: "Hanya tautan resmi Google Maps yang didukung." };
  }

  try {
    let finalUrl = parsed.href;

    // Follow redirect if it's a short URL
    if (parsed.hostname.includes("goo.gl")) {
      const response = await fetch(parsed.href, { method: "HEAD", redirect: "follow" });
      const redirectedUrl = new URL(response.url || parsed.href);
      if (ALLOWED_MAP_HOSTS[redirectedUrl.hostname.toLowerCase()]) {
        finalUrl = redirectedUrl.href;
      }
    }

    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = finalUrl.match(regex);

    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
      };
    }

    return { error: "Tidak dapat mengekstrak koordinat dari tautan tersebut." };
  } catch (error) {
    console.error("Error extracting coordinates:", error);
    return { error: "Gagal memproses tautan Google Maps." };
  }
}
