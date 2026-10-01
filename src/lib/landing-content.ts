import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  AllLandingContent,
  LandingSectionKey,
} from "@/types/landing";

export const DEFAULT_LANDING_CONTENT: AllLandingContent = {
  hero: {
    badgeText: "Reader now, Leader tomorrow!",
    title: "Bimbingan Belajar Terbaik & Ramah Anak",
    subtitle: "Les Baca AHE Sumokembangsri & AHE Junwangi — Uzma Course",
    description:
      "Pusat bimbingan belajar calistung anak hebat di Sidoarjo. Melayani les baca AHE Sumokembangsri (Balongbendo) dan les baca AHE Junwangi (Krian) sejak 2022 dengan metode ceria tanpa trauma belajar.",
    featurePills: [
      "Les Baca Tulis AHE",
      "Ala Sekolah (ASE)",
      "Brainy English",
      "Mapel SD",
    ],
    primaryCtaText: "Daftar Sekarang",
    secondaryCtaText: "Lihat Program",
    secondaryCtaHref: "#programs",
  },
  programs: {
    title: "Program Belajar Unggulan",
    subtitle:
      "Sistem belajar intensif dengan rasio murid kecil untuk hasil optimal dan anak senang belajar",
    items: [
      {
        id: "ahe",
        initials: "AHE",
        name: "Les Baca Tulis (AHE)",
        tagline: "Belajar Baca & Tulis Cepat dan Menyenangkan",
        description:
          "Metode AHE yang teruji klinis dan ramah anak. Membantu anak lancar membaca dan menulis tanpa mengeja dan tanpa beban.",
        ageRange: "Mulai 3,5 tahun",
        icon: "BookOpen",
        type: "franchise",
        licenseInfo: {
          provider: "Ahe Indonesia",
        },
        system: "1 guru max 2 murid",
        duration: "30 menit / sesi",
        frequency: "3x / minggu (12x / bulan)",
        features: [
          "Buku Modul Eksklusif",
          "Buku Penghubung",
          "Piagam & Piala Kelulusan",
        ],
      },
      {
        id: "ase",
        initials: "ASE",
        name: "Ala Sekolah (ASE)",
        tagline: "Stimulasi Tumbuh Kembang Sensori & Kognitif",
        description:
          "Program stimulasi sensori, motorik, dan kesiapan belajar bagi anak usia dini dengan metode interaktif yang menyenangkan.",
        ageRange: "Mulai 3 tahun",
        icon: "Sparkles",
        type: "franchise",
        licenseInfo: {
          provider: "Ahe Indonesia",
        },
        system: "1 guru max 2 murid",
        duration: "30 menit / sesi",
        frequency: "3x / minggu (12x / bulan)",
        features: [
          "Buku Modul",
          "Buku Penghubung",
          "Permainan Sensori Motorik",
        ],
      },
      {
        id: "bee",
        initials: "BEE",
        name: "Brainy English Education (BEE)",
        tagline: "English Made Fun for Kids",
        description:
          "Program bahasa Inggris interaktif untuk membangun kosakata, pelafalan, dan keberanian berbicara bahasa Inggris sejak kecil.",
        ageRange: "Mulai 4 tahun",
        icon: "Globe",
        type: "franchise",
        licenseInfo: {
          provider: "Brainy English Education",
        },
        system: "1 guru max 2 murid",
        duration: "30 menit / sesi",
        frequency: "3x / minggu (12x / bulan)",
        features: [
          "Buku Modul Bergambar",
          "Buku Penghubung",
          "Interactive Games",
        ],
      },
      {
        id: "mapel",
        initials: "MAPEL",
        name: "Les Mata Pelajaran SD",
        tagline: "Pendampingan Belajar Kurikulum Sekolah",
        description:
          "Bimbingan belajar private intensif untuk memahami materi sekolah reguler, persiapan ulangan harian, PTS, PAS, dan PR.",
        ageRange: "Siswa SD",
        icon: "GraduationCap",
        type: "original",
        system: "Private 1 guru 1 murid",
        duration: "30 menit / sesi",
        frequency: "3x / minggu (12x / bulan)",
        features: [
          "Private 1 Guru 1 Murid",
          "Buku Penghubung",
          "Bimbingan PR & Ujian",
        ],
      },
    ],
  },
  why_us: {
    title: "Mengapa Uzma Course?",
    subtitle:
      "Komitmen kami mendampingi putra-putri Anda belajar dengan nyaman, percaya diri, dan berprestasi",
    items: [
      {
        icon: "Award",
        title: "Metode AHE Teruji",
        description:
          "Menggunakan metode AHE yang telah terbukti efektif untuk anak usia dini.",
      },
      {
        icon: "Users",
        title: "Guru Berpengalaman",
        description:
          "Pengajar terlatih dan bersertifikat dengan pengalaman mengajar anak.",
      },
      {
        icon: "UserCheck",
        title: "Kelas Kecil & Personal",
        description:
          "Maksimal 5 anak per kelas untuk perhatian lebih personal.",
      },
      {
        icon: "Clock",
        title: "Jadwal Fleksibel",
        description:
          "Pilihan jadwal yang bisa disesuaikan dengan aktivitas anak.",
      },
    ],
  },
  facilities: {
    title: "Fasilitas Ahe SumoWangi",
    subtitle:
      "Kenyamanan dan sarana lengkap untuk mendukung proses belajar yang ceria, aman, dan kondusif",
    items: [
      {
        title: "Guru Berlisensi & Kompeten",
        description:
          "Pengajar melalui seleksi ketat dan pelatihan resmi bersertifikat.",
        icon: "Award",
      },
      {
        title: "Tempat Belajar Nyaman",
        description:
          "Ruangan bersih, sejuk, dan kondusif untuk konsentrasi belajar anak.",
        icon: "Home",
      },
      {
        title: "Piagam & Piala Kelulusan",
        description:
          "Apresiasi pencapaian setiap level belajar untuk membangun rasa percaya diri.",
        icon: "Trophy",
      },
      {
        title: "Kursi Tunggu Wali Murid",
        description:
          "Fasilitas ruang tunggu yang nyaman bagi orang tua saat mengantar anak.",
        icon: "Armchair",
      },
      {
        title: "Free Air Mineral & Free Wi-Fi",
        description:
          "Kenyamanan ekstra selama berada di lokasi bimbingan belajar.",
        icon: "Wifi",
      },
      {
        title: "Permainan Edukasi",
        description:
          "Media edukatif interaktif untuk selingan belajar yang menyenangkan.",
        icon: "Gamepad2",
      },
      {
        title: "Diskon SPP Setiap Bulan",
        description:
          "Program apresiasi & promo menarik setiap bulan bagi murid (*S&K berlaku).",
        icon: "BadgePercent",
      },
      {
        title: "Trial Class Gratis",
        description:
          "1 sesi percobaan gratis untuk mencoba metode pengajaran secara langsung.",
        icon: "Sparkles",
      },
    ],
  },
  team: {
    title: "Pengelola & Tenaga Pendidik",
    subtitle:
      "Didukung pengajar berdedikasi, tersertifikasi, dan penuh kasih mendampingi buah hati Anda",
    teamPhotoUrl: "/images/team.jpg",
    teamPhotoAlt: "Tim Pengajar Ahe SumoWangi",
    teamBadge: "Tenaga Pengajar Berlisensi",
    teamHeading: "Tim Pendidik Ramah & Berpengalaman",
    teamDescription:
      "Pengajar melalui seleksi ketat dan pelatihan berkesinambungan untuk memastikan pendekatan belajar selalu sabar, suportif, dan menyenangkan bagi anak.",
    founderName: "Nurul Ilmi Mega Puspita, S.Pd.",
    founderRole: "Pengelola Ahe SumoWangi / Uzma Course",
    founderQuote:
      "Lembaga bimbingan belajar di bawah naungan Ahe Indonesia yang melayani program belajar sejak 2022. Berkomitmen menghadirkan metode pengajaran ramah anak tanpa rasa takut atau trauma belajar.",
    founderPhotoUrl: "/images/founder-fallback.webp",
    founderPhotoAlt: "Foto Profil Nurul Ilmi Mega Puspita, S.Pd. - Pengelola Uzma Course",
    values: [
      {
        title: "Tanpa Trauma",
        description: "Pendekatan belajar bebas tekanan dan menyenangkan.",
        icon: "Heart",
      },
      {
        title: "Sejak 2022",
        description: "Telah meluluskan ratusan murid cerdas dan mandiri.",
        icon: "Award",
      },
    ],
    galleryImageUrl: "/images/gallery-grid.jpg",
    galleryImageAlt: "Galeri Kegiatan Belajar dan Wisuda Ahe SumoWangi",
    galleryCaption:
      "Dokumentasi keceriaan belajar, pendampingan personal, dan momen wisuda kelulusan di Ahe SumoWangi.",
  },
  testimonials: {
    title: "Kata Orang Tua Murid",
    subtitle:
      "Pengalaman dan kepuasan para orang tua yang mempercayakan pendidikan putra-putrinya di Uzma Course",
    items: [
      {
        quote:
          "Alhamdulillah anak saya sekarang sudah lancar membaca dan berhitung sebelum masuk SD. Gurunya sangat sabar dan metodenya menyenangkan.",
        parentName: "Ibu Rahma",
        programLabel: "Orang Tua Murid AHE",
      },
      {
        quote:
          "Kemampuan bahasa Inggris anak saya meningkat pesat. Sekarang lebih percaya diri berbicara dan kosakatanya makin kaya.",
        parentName: "Bapak Dimas",
        programLabel: "Orang Tua Murid BEE",
      },
      {
        quote:
          "Nilai matematika dan IPA anak saya di SMP meningkat drastis setelah rutin les di Uzma Course. Pendampingannya sangat fokus.",
        parentName: "Ibu Siti",
        programLabel: "Orang Tua Murid Bimbel SMP",
      },
      {
        quote:
          "Anak saya selalu bersemangat tiap jadwal les. Pengajarnya ramah dan pendekatannya sangat personal untuk tiap anak.",
        parentName: "Ibu Fitri",
        programLabel: "Orang Tua Murid AHE & BEE",
      },
    ],
  },
  videos: {
    title: "Video Kegiatan Kami",
    subtitle:
      "Suasana belajar yang ceria, interaktif, dan penuh semangat di Uzma Course",
    items: [
      {
        id: "video-uzma-tiktok-1",
        title: "Suasana Belajar Membaca di Ahe SumoWangi",
        source: "tiktok",
        embedUrl: "https://www.tiktok.com/player/v1/7683120078589611285",
      },
    ],
  },
  locations: {
    title: "Lokasi Kami",
    subtitle:
      "Kunjungi cabang Uzma Course terdekat di area Sidoarjo untuk konsultasi langsung",
    items: [
      {
        id: "balongbendo",
        name: "Cabang Balongbendo",
        subName: "Ahe Sumokembangsri",
        address: "Sumotuwo, RT 20 RW 3, Sumokembangsri, Balongbendo, Sidoarjo",
        mapUrl:
          "https://www.google.com/maps?q=-7.4320527,112.5054893&output=embed",
        gmapsUrl: "https://maps.app.goo.gl/qaJuRjZcDDTv4qQx9",
      },
      {
        id: "krian",
        name: "Cabang Krian",
        subName: "Ahe Junwangi",
        address: "Junwatu, RT 2 RW 1, Junwangi, Krian, Sidoarjo",
        mapUrl:
          "https://www.google.com/maps?q=-7.4062116,112.6081986&output=embed",
        gmapsUrl: "https://maps.app.goo.gl/KWoXUAYNvVJTYs5r5",
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle:
      "Pertanyaan yang sering diajukan seputar pendaftaran, metode belajar, dan fasilitas di Uzma Course",
    items: [
      {
        id: "faq-daftar",
        question: "Bagaimana cara mendaftar?",
        answer:
          "Hubungi kami via WhatsApp untuk konsultasi awal dan penjadwalan. Tim kami akan membantu memilih program yang paling sesuai dengan kebutuhan anak Anda.",
      },
      {
        id: "faq-biaya",
        question: "Berapa biaya per bulan?",
        answer:
          "Biaya bervariasi per program dan cabang. Hubungi kami via WhatsApp untuk informasi rincian biaya dan promo yang sedang berlangsung.",
      },
      {
        id: "faq-trial",
        question: "Apakah ada kelas percobaan?",
        answer:
          "Ya, kami menyediakan satu sesi percobaan gratis untuk setiap program agar anak dapat merasakan langsung suasana belajar di Uzma Course.",
      },
      {
        id: "faq-jumlah",
        question: "Berapa jumlah murid per kelas?",
        answer:
          "Maksimal 5 anak per kelas untuk pembelajaran yang lebih personal, fokus, dan efektif bagi setiap murid.",
      },
      {
        id: "faq-lokasi",
        question:
          "Di mana lokasi les baca AHE Sumokembangsri dan AHE Junwangi?",
        answer:
          "Uzma Course memiliki dua unit resmi di Sidoarjo: Unit les baca AHE Sumokembangsri (Sumotuwo, Balongbendo) dan unit les baca AHE Junwangi (Junwatu, Krian). Keduanya dilengkapi fasilitas belajar ramah anak dan guru berlisensi.",
      },
      {
        id: "faq-usia",
        question:
          "Kapan anak bisa mulai les baca AHE di Sumokembangsri atau Junwangi?",
        answer:
          "Anak dapat mulai belajar les baca tulis AHE sejak usia 3,5 tahun. Metode AHE dirancang bertahap tanpa mengeja dan tanpa beban hafalan sehingga anak belajar dengan ceria tanpa rasa takut.",
      },
      {
        id: "faq-jumlah-sesi",
        question: "Berapa jumlah murid per sesi belajar?",
        answer:
          "Sistem pembelajaran sangat privat dan personal: Les Baca AHE maksimal 2 anak per guru, ASE maksimal 2 anak, BEE maksimal 2 anak, dan Bimbel Mapel 1 anak 1 guru (private).",
      },
    ],
  },
  cta: {
    title: "Siap Memulai Perjalanan Belajar Anak Anda?",
    subtitle: "Konsultasi gratis, daftar sekarang!",
    buttonText: "Hubungi Kami via WhatsApp",
  },
  footer: {
    tagline: "Reader now, Leader tomorrow!",
    socialLinks: {
      instagram: "https://www.instagram.com/ahesumokembangsri.ahejunwangi",
      facebook: "https://www.facebook.com/share/1JKAhpJnPP/?mibextid=qi2Omg",
    },
    contactPhone: "6285730332379",
    contactWaDisplay: "085730332379",
    navLinks: [
      { label: "Program Belajar", href: "#programs" },
      { label: "Keunggulan", href: "#keunggulan" },
      { label: "Fasilitas", href: "#fasilitas" },
      { label: "Pengelola & Guru", href: "#pengelola" },
      { label: "Testimoni", href: "#testimoni" },
      { label: "Lokasi Cabang", href: "#lokasi" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  navbar: {
    brandName: "Uzma Course",
    navLinks: [
      { label: "Program", href: "#programs" },
      { label: "Keunggulan", href: "#keunggulan" },
      { label: "Fasilitas", href: "#fasilitas" },
      { label: "Pengelola", href: "#pengelola" },
      { label: "Testimoni", href: "#testimoni" },
      { label: "Lokasi", href: "#lokasi" },
      { label: "FAQ", href: "#faq" },
    ],
    ctaText: "Hubungi Kami",
  },
  floating_wa: {
    isEnabled: true,
  },
};

function getSupabaseAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null;
  }
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getLandingContent(): Promise<AllLandingContent> {
  const result: AllLandingContent = { ...DEFAULT_LANDING_CONTENT };

  try {
    const supabase = getSupabaseAnonClient();
    if (!supabase) return result;

    const { data, error } = await supabase
      .from("landing_content")
      .select("section, content");

    if (error || !data) {
      return result;
    }

    for (const row of data) {
      const key = row.section as LandingSectionKey;
      if (key in result && row.content && typeof row.content === "object") {
        result[key] = {
          ...result[key],
          ...(row.content as object),
        } as never;
      }
    }

    return result;
  } catch (err) {
    console.error("Error fetching landing content:", err);
    return result;
  }
}

export async function getLandingSectionContent<K extends LandingSectionKey>(
  section: K
): Promise<AllLandingContent[K]> {
  const fallback = DEFAULT_LANDING_CONTENT[section];

  try {
    const supabase = getSupabaseAnonClient();
    if (!supabase) return fallback;

    const { data, error } = await supabase
      .from("landing_content")
      .select("content")
      .eq("section", section)
      .maybeSingle();

    if (error || !data?.content || typeof data.content !== "object") {
      return fallback;
    }

    return {
      ...fallback,
      ...(data.content as object),
    } as AllLandingContent[K];
  } catch (err) {
    console.error(`Error fetching landing section ${section}:`, err);
    return fallback;
  }
}
