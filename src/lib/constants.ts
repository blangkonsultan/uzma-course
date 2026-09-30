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

export const PROGRAMS = [
  {
    id: "ahe",
    name: "Les Baca Tulis (AHE)",
    tagline: "Belajar Baca & Tulis Cepat dan Menyenangkan",
    description: "Metode AHE yang teruji klinis dan ramah anak. Membantu anak lancar membaca dan menulis tanpa mengeja dan tanpa beban.",
    ageRange: "Mulai 3,5 tahun",
    icon: "BookOpen",
    system: "1 guru max 2 murid",
    duration: "30 menit / sesi",
    frequency: "3x / minggu (12x / bulan)",
    features: ["Buku Modul Eksklusif", "Buku Penghubung", "Piagam & Piala Kelulusan"],
  },
  {
    id: "hitung",
    name: "Les Hitung Dasar",
    tagline: "Fondasi Matematika Dasar Ceria & Mudah",
    description: "Program belajar konsep angka, penjumlahan, dan pengurangan dengan metode bertahap yang mudah dipahami anak usia dini.",
    ageRange: "Mulai 4 tahun",
    icon: "Calculator",
    system: "1 guru max 4 murid",
    duration: "30 menit / sesi",
    frequency: "3x / minggu (12x / bulan)",
    features: ["Buku Modul", "Buku Penghubung", "Permainan Angka Edukatif"],
  },
  {
    id: "bee",
    name: "Brainy English Education (BEE)",
    tagline: "English Made Fun for Kids",
    description: "Program bahasa Inggris interaktif untuk membangun kosakata, pelafalan, dan keberanian berbicara bahasa Inggris sejak kecil.",
    ageRange: "Mulai 4 tahun",
    icon: "Globe",
    system: "1 guru max 2 murid",
    duration: "30 menit / sesi",
    frequency: "3x / minggu (12x / bulan)",
    features: ["Buku Modul Bergambar", "Buku Penghubung", "Interactive Games"],
  },
  {
    id: "mapel",
    name: "Les Mata Pelajaran SD",
    tagline: "Pendampingan Belajar Kurikulum Sekolah",
    description: "Bimbingan belajar private intensif untuk memahami materi sekolah reguler, persiapan ulangan harian, PTS, PAS, dan PR.",
    ageRange: "Siswa SD",
    icon: "GraduationCap",
    system: "Private 1 guru 1 murid",
    duration: "30 menit / sesi",
    frequency: "3x / minggu (12x / bulan)",
    features: ["Private 1 Guru 1 Murid", "Buku Penghubung", "Bimbingan PR & Ujian"],
  },
] as const;

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

export const BRANCHES = [
  {
    id: "balongbendo",
    name: "Cabang Balongbendo",
    subName: "Ahe Sumokembangsri",
    address: "Sumotuwo, RT 20 RW 3, Sumokembangsri, Balongbendo, Sidoarjo",
    mapUrl: "https://www.google.com/maps?q=-7.4320527,112.5054893&output=embed",
    gmapsUrl: "https://maps.app.goo.gl/qaJuRjZcDDTv4qQx9",
  },
  {
    id: "krian",
    name: "Cabang Krian",
    subName: "Ahe Junwangi",
    address: "Junwatu, RT 2 RW 1, Junwangi, Krian, Sidoarjo",
    mapUrl: "https://www.google.com/maps?q=-7.4062116,112.6081986&output=embed",
    gmapsUrl: "https://maps.app.goo.gl/KWoXUAYNvVJTYs5r5",
  },
] as const;

export type VideoSource = "youtube" | "tiktok";

export const PROMO_VIDEOS: Array<{
  id: string;
  title: string;
  source: VideoSource;
  embedUrl: string;
}> = [];
