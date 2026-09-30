import { WA_BASE_URL } from "./constants";

export function buildWaLink(context?: string): string {
  const message = context
    ? `Halo Uzma Course, saya ingin bertanya tentang ${context}.`
    : "Halo Uzma Course, saya ingin informasi lebih lanjut.";
  return `${WA_BASE_URL}?text=${encodeURIComponent(message)}`;
}
