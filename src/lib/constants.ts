export const SITE_NAME = "Uzma Course";
export const WA_NUMBER = "6285708110736";
export const WA_BASE_URL = `https://wa.me/${WA_NUMBER}`;

export const PROGRAMS = [
  {
    id: "ahe",
    name: "AHE — Anak Hebat",
    tagline: "Belajar Baca, Tulis, Hitung dengan Menyenangkan",
    description: "Program calistung untuk anak usia dini dengan metode AHE yang mudah dipahami.",
    ageRange: "3–7 tahun",
    icon: "BookOpen",
  },
  {
    id: "bee",
    name: "BEE — Bright Excellent English",
    tagline: "English Made Fun for Kids",
    description: "Program bahasa Inggris untuk anak dengan pendekatan interaktif dan menyenangkan.",
    ageRange: "5–12 tahun",
    icon: "Globe",
  },
  {
    id: "bimbel",
    name: "Bimbel SD–SMP",
    tagline: "Pendamping Belajar Mata Pelajaran Sekolah",
    description: "Bimbingan belajar mata pelajaran sekolah reguler untuk siswa SD dan SMP.",
    ageRange: "6–15 tahun",
    icon: "GraduationCap",
  },
] as const;

export const BRANCHES = [
  {
    id: "balongbendo",
    name: "Cabang Balongbendo",
    address: "Sumokembangsri, Balongbendo, Sidoarjo",
    mapUrl: "", // add Google Maps embed URL when available
  },
  {
    id: "krian",
    name: "Cabang Krian",
    address: "Junwangi, Krian, Sidoarjo",
    mapUrl: "", // add Google Maps embed URL when available
  },
] as const;

export type VideoSource = "youtube" | "tiktok";

// Mutable array (not `as const`) so user can add/remove videos without type errors.
// YouTube embedUrl format: "https://www.youtube.com/embed/VIDEO_ID"
// TikTok embedUrl format: "https://www.tiktok.com/embed/v2/VIDEO_ID"
export const PROMO_VIDEOS: Array<{
  id: string;
  title: string;
  source: VideoSource;
  embedUrl: string;
}> = [];
