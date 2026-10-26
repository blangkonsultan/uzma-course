import "server-only";
import type { GuideScreenshot } from "@/types/guides";

export const GURU_SCREENSHOTS = {
  login: {
    src: "/guides/guru/login-mobile.png", width: 390, height: 844,
    alt: "Form masuk portal pada ponsel tanpa kredensial terisi",
    caption: "Form asli pada ukuran ponsel. Kolom email dan kata sandi kosong; titik pada kolom adalah placeholder.",
    sourceRoute: "/login", state: "empty-mobile-login",
  },
  home: {
    src: "/guides/guru/beranda.png", width: 390, height: 844,
    alt: "Beranda Guru Demo 01 dengan status presensi dan pintasan jadwal serta honor",
    caption: "Beranda akun demo sebelum presensi. Ringkasan contoh tidak mewakili aktivitas guru sebenarnya.",
    sourceRoute: "/guru", state: "demo-home-before-attendance",
  },
  profile: {
    src: "/guides/guru/profil.png", width: 390, height: 844,
    alt: "Profil guru dengan tautan Panduan Pengguna, kata sandi, notifikasi, dan keluar",
    caption: "Identitas dan email .test milik akun demo. Panduan dibuka dari Profil tanpa menambah tab bawah.",
    sourceRoute: "/guru/profil", state: "demo-profile-help-entry",
  },
  schedule: {
    src: "/guides/guru/jadwal.png", width: 390, height: 844,
    alt: "Jadwal hari Senin dengan cabang, jam, dua murid demo, dan Lihat Kartu Mengajar",
    caption: "Daftar Murid dibuka pada kelas demo yang memiliki penempatan murid dan kartu yang sudah dikirim.",
    sourceRoute: "/guru/jadwal", state: "populated-monday-class-expanded",
  },
  attendance: {
    src: "/guides/guru/presensi.png", width: 390, height: 844,
    alt: "Mode Online, cabang tugas, radius, jarak GPS, serta Check-In dan Check-Out",
    caption: "Akun demo dengan posisi uji browser di cabang untuk menunjukkan kontrol. Ini bukan bukti kehadiran guru sebenarnya.",
    sourceRoute: "/guru/absen", state: "local-demo-geolocation-ready",
  },
  gps: {
    src: "/guides/guru/presensi-gps.png", width: 390, height: 844,
    alt: "Izin Lokasi GPS Belum Aktif dan tombol meminta izin ulang",
    caption: "Keadaan nyata ketika izin lokasi browser uji tidak diberikan; label shift adalah informasi jadwal saat capture.",
    sourceRoute: "/guru/absen", state: "browser-location-permission-denied",
  },
  dayOff: {
    src: "/guides/guru/presensi-libur.png", width: 390, height: 844,
    alt: "Halaman Hari Ini Libur untuk akun yang tidak memiliki kelas hari tersebut",
    caption: "Guru Demo 02 memang tidak memiliki jadwal aktif hari Sabtu saat capture; tanggal perangkat tidak diubah.",
    sourceRoute: "/guru/absen", state: "real-no-class-today",
  },
  queue: {
    src: "/guides/guru/presensi-antrean.png", width: 390, height: 844,
    alt: "Mode Offline dengan 1 Antrean meskipun tombol sudah menampilkan Sudah Masuk",
    caption: "Antrean benar-benar tersimpan di IndexedDB akun demo. Saat gambar diambil, server belum memiliki record tersebut.",
    sourceRoute: "/guru/absen", state: "genuine-unsynced-demo-check-in",
  },
  checkOut: {
    src: "/guides/guru/presensi-pulang.png", width: 390, height: 844,
    alt: "Presensi demo sudah masuk dan Check-Out tersedia dalam Mode Online",
    caption: "Antrean contoh sudah disinkronkan dan halaman dimuat ulang dari server sebelum menampilkan Check-Out.",
    sourceRoute: "/guru/absen", state: "synced-demo-check-in-before-check-out",
  },
  completedAttendance: {
    src: "/guides/guru/presensi-selesai.png", width: 390, height: 844,
    alt: "Sudah Masuk dan Sudah Pulang setelah check-out contoh berhasil",
    caption: "Alur demo lokal selesai dan waktu masuk/pulang terverifikasi pada server. Record uji dibersihkan setelah verifikasi.",
    sourceRoute: "/guru/absen", state: "confirmed-demo-check-out",
  },
  cardDraft: {
    src: "/guides/guru/kartu-draft.png", width: 390, height: 844,
    alt: "Kartu mengajar yang dapat diedit dengan murid, status, capaian dan catatan contoh",
    caption: "Form nyata untuk kelas berisi dua murid demo pada tanggal yang sesuai hari jadwal, sebelum simpan.",
    sourceRoute: "/guru/mengajar/[id]", state: "populated-unsaved-demo-card",
  },
  cardSaved: {
    src: "/guides/guru/kartu-simpan.png", width: 390, height: 844,
    alt: "Pesan Draft kartu mengajar tersimpan dengan isian demo",
    caption: "Draft demo sungguh disimpan dan isinya tetap ada setelah reload. Record yang dibuat untuk capture kemudian dibersihkan.",
    sourceRoute: "/guru/mengajar/[id]", state: "persisted-demo-draft-confirmation",
  },
  cardSubmitted: {
    src: "/guides/guru/kartu-submitted.png", width: 390, height: 844,
    alt: "Kartu demo berstatus Submitted dengan isian terkunci",
    caption: "Kartu submitted yang sudah tersedia sebelum capture. Kontrol tanggal/status dinonaktifkan dan catatan hanya dapat dibaca.",
    sourceRoute: "/guru/mengajar/[id]", state: "existing-submitted-read-only-card",
  },
  honor: {
    src: "/guides/guru/honor.png", width: 390, height: 844,
    alt: "Estimasi honor berjalan, fee sesi, tunjangan, dan Garansi Minimum Terdaftar",
    caption: "Contoh estimasi akun demo. Nominal minimum terdaftar dibaca terpisah dari Total Take-Home Pay; bukan bukti transfer.",
    sourceRoute: "/guru/honor", state: "own-open-period-estimate",
  },
  password: {
    src: "/guides/guru/password.png", width: 390, height: 844,
    alt: "Form Kata Sandi Lama, Kata Sandi Baru, dan Konfirmasi tanpa nilai terisi",
    caption: "Tidak ada kata sandi pada screenshot dan tidak ada perubahan kredensial yang dijalankan untuk capture.",
    sourceRoute: "/guru/profil/password", state: "empty-password-change-form",
  },
  notifications: {
    src: "/guides/guru/notifikasi.png", width: 390, height: 844,
    alt: "Notifikasi Perangkat aktif dan kontrol Tes Pengiriman dengan Uji Coba",
    caption: "Izin nyata browser uji diaktifkan sehingga kontrol diagnostik muncul. Bukan screenshot bilah notifikasi OS atau bukti pengingat otomatis.",
    sourceRoute: "/guru/profil", state: "browser-permission-granted-test-controls",
  },
} as const satisfies Record<string, GuideScreenshot>;
