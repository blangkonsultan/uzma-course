export const SITE_NAME = "Uzma Course";
export const TAGLINE = "Reader now, Leader tomorrow!";
export const WA_NUMBER = "6285730332379";
export const WA_DISPLAY_NUMBER = "085730332379";
export const WA_BASE_URL = `https://wa.me/${WA_NUMBER}`;

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/ahesumokembangsri.ahejunwangi",
  facebook: "https://www.facebook.com/share/1JKAhpJnPP/?mibextid=qi2Omg",
} as const;

export const FOUNDER = {
  name: "Nurul Ilmi Mega Puspita, S.Pd.",
  role: "Pengelola Ahe SumoWangi / Uzma Course",
  bio: "Lembaga bimbingan belajar di bawah naungan Ahe Indonesia yang melayani program belajar sejak 2022. Berkomitmen menghadirkan metode pengajaran ramah anak tanpa rasa takut atau trauma belajar.",
} as const;

export const FACILITIES = [
  {
    title: "Guru Berlisensi & Kompeten",
    description: "Pengajar melalui seleksi ketat dan pelatihan resmi bersertifikat.",
    icon: "Award",
  },
  {
    title: "Tempat Belajar Nyaman",
    description: "Ruangan bersih, sejuk, dan kondusif untuk konsentrasi belajar anak.",
    icon: "Home",
  },
  {
    title: "Piagam & Piala Kelulusan",
    description: "Apresiasi pencapaian setiap level belajar untuk membangun rasa percaya diri.",
    icon: "Trophy",
  },
  {
    title: "Kursi Tunggu Wali Murid",
    description: "Fasilitas ruang tunggu yang nyaman bagi orang tua saat mengantar anak.",
    icon: "Armchair",
  },
  {
    title: "Free Air Mineral & Free Wi-Fi",
    description: "Kenyamanan ekstra selama berada di lokasi bimbingan belajar.",
    icon: "Wifi",
  },
  {
    title: "Permainan Edukasi",
    description: "Media edukatif interaktif untuk selingan belajar yang menyenangkan.",
    icon: "Gamepad2",
  },
  {
    title: "Diskon SPP Setiap Bulan",
    description: "Program apresiasi & promo menarik setiap bulan bagi murid (*S&K berlaku).",
    icon: "BadgePercent",
  },
  {
    title: "Trial Class Gratis",
    description: "1 sesi percobaan gratis untuk mencoba metode pengajaran secara langsung.",
    icon: "Sparkles",
  },
] as const;

export type VideoSource = "youtube" | "tiktok";

export const PROMO_VIDEOS: Array<{
  id: string;
  title: string;
  source: VideoSource;
  embedUrl: string;
}> = [];
