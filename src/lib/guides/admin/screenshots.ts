import "server-only";
import type { GuideScreenshot } from "@/types/guides";

export const ADMIN_SCREENSHOTS = {
  "login": {
    "src": "/guides/admin/login-desktop.png",
    "width": 1440,
    "height": 1000,
    "alt": "Halaman Masuk ke Portal",
    "caption": "Form login desktop sebelum email dan kata sandi diisi.",
    "sourceRoute": "/login",
    "state": "login-empty"
  },
  "dashboard": {
    "src": "/guides/admin/dashboard.png",
    "width": 1440,
    "height": 1000,
    "alt": "Dashboard admin dan kelompok navigasi",
    "caption": "Dashboard contoh memperlihatkan menu operasional, ringkasan data, dan akses panduan.",
    "sourceRoute": "/admin",
    "state": "admin-dashboard"
  },
  "branchList": {
    "src": "/guides/admin/cabang-list.png",
    "width": 1440,
    "height": 1000,
    "alt": "Daftar Data Cabang",
    "caption": "Daftar cabang dengan pencarian, status, serta tindakan detail dan edit.",
    "sourceRoute": "/admin/cabang",
    "state": "branch-list"
  },
  "branchForm": {
    "src": "/guides/admin/cabang-form.png",
    "width": 1184,
    "height": 1394,
    "alt": "Form tambah cabang",
    "caption": "Isian identitas, alamat, peta, koordinat, dan radius geofence pada form cabang baru.",
    "sourceRoute": "/admin/cabang/tambah",
    "state": "branch-create-form"
  },
  "branchDetail": {
    "src": "/guides/admin/cabang-detail.png",
    "width": 1184,
    "height": 936,
    "alt": "Detail lokasi cabang",
    "caption": "Detail cabang contoh dan informasi lokasinya sebelum memilih Edit.",
    "sourceRoute": "/admin/cabang/junwangi",
    "state": "branch-detail"
  },
  "branchStatus": {
    "src": "/guides/admin/cabang-status.png",
    "width": 1440,
    "height": 1000,
    "alt": "Konfirmasi menonaktifkan cabang",
    "caption": "Dialog menjelaskan dampak nonaktif. Capture berhenti sebelum Ya, Nonaktifkan dipilih.",
    "sourceRoute": "/admin/cabang/junwangi",
    "state": "branch-status-confirmation"
  },
  "programList": {
    "src": "/guides/admin/program-list.png",
    "width": 1440,
    "height": 1000,
    "alt": "Daftar Program Belajar",
    "caption": "Daftar program beserta akses ke detail, edit, dan status.",
    "sourceRoute": "/admin/program",
    "state": "program-list"
  },
  "programForm": {
    "src": "/guides/admin/program-form.png",
    "width": 1184,
    "height": 1534,
    "alt": "Form program dan varian belajar",
    "caption": "Form program baru menampilkan identitas, lisensi, varian, biaya, dan fasilitas.",
    "sourceRoute": "/admin/program/tambah",
    "state": "program-create-form"
  },
  "shiftList": {
    "src": "/guides/admin/shift-list.png",
    "width": 1440,
    "height": 1000,
    "alt": "Daftar Data Shift",
    "caption": "Daftar shift per cabang dengan jam operasional dan tindakan pengelolaan.",
    "sourceRoute": "/admin/shift",
    "state": "shift-list"
  },
  "shiftForm": {
    "src": "/guides/admin/shift-form.png",
    "width": 1184,
    "height": 936,
    "alt": "Form tambah shift",
    "caption": "Pilihan cabang, nama shift, Jam Mulai, dan Jam Selesai sebelum disimpan.",
    "sourceRoute": "/admin/shift/tambah",
    "state": "shift-create-form"
  },
  "teacherList": {
    "src": "/guides/admin/guru-list.png",
    "width": 1440,
    "height": 1000,
    "alt": "Daftar Data Guru",
    "caption": "Daftar guru demo dengan filter dan akses detail, edit, serta status.",
    "sourceRoute": "/admin/guru",
    "state": "teacher-list"
  },
  "teacherForm": {
    "src": "/guides/admin/guru-form.png",
    "width": 1184,
    "height": 1759,
    "alt": "Form membuat akun guru",
    "caption": "Form akun baru memperlihatkan penempatan, program, kompensasi, dan bank; kata sandi tidak diisi pada screenshot.",
    "sourceRoute": "/admin/guru/tambah",
    "state": "teacher-create-form"
  },
  "teacherDetail": {
    "src": "/guides/admin/guru-detail.png",
    "width": 1184,
    "height": 936,
    "alt": "Detail guru demo",
    "caption": "Profil guru contoh dan tindakan pengelolaannya. Seluruh identitas dan data bank pada contoh adalah data demo.",
    "sourceRoute": "/admin/guru/[id]",
    "state": "teacher-detail"
  },
  "teacherCompensation": {
    "src": "/guides/admin/guru-kompensasi.png",
    "width": 1184,
    "height": 1722,
    "alt": "Form penempatan dan kompensasi guru",
    "caption": "Form edit contoh menampilkan cabang penugasan, program, bank, tunjangan, dan pengaturan honor minimum.",
    "sourceRoute": "/admin/guru/[id]/edit",
    "state": "teacher-edit-form"
  },
  "studentList": {
    "src": "/guides/admin/murid-list.png",
    "width": 1440,
    "height": 1000,
    "alt": "Daftar Data Murid",
    "caption": "Daftar murid demo dan akses ke detail, perubahan data, serta status aktif.",
    "sourceRoute": "/admin/murid",
    "state": "student-list"
  },
  "studentForm": {
    "src": "/guides/admin/murid-form.png",
    "width": 1184,
    "height": 1452,
    "alt": "Form pendaftaran murid",
    "caption": "Isian murid, wali, cabang, dan pilihan program sebelum disimpan.",
    "sourceRoute": "/admin/murid/tambah",
    "state": "student-create-form"
  },
  "studentDetail": {
    "src": "/guides/admin/murid-detail.png",
    "width": 1184,
    "height": 936,
    "alt": "Detail murid demo",
    "caption": "Detail identitas dan enrollment murid contoh untuk pemeriksaan hasil penyimpanan.",
    "sourceRoute": "/admin/murid/[id]",
    "state": "student-detail"
  },
  "studentEnrollment": {
    "src": "/guides/admin/murid-enrollment.png",
    "width": 1184,
    "height": 2279,
    "alt": "Detail enrollment dan siklus SPP",
    "caption": "Form edit contoh menampilkan varian, status program, awal siklus, nominal SPP, dan diskon per program.",
    "sourceRoute": "/admin/murid/[id]/edit",
    "state": "student-edit-enrollment"
  },
  "draftList": {
    "src": "/guides/admin/jadwal-draf.png",
    "width": 1440,
    "height": 1000,
    "alt": "Daftar Draf Jadwal",
    "caption": "Daftar draf menunjukkan status serta akses papan jadwal, edit, dan cetak guru atau murid.",
    "sourceRoute": "/admin/draft",
    "state": "draft-list"
  },
  "draftForm": {
    "src": "/guides/admin/jadwal-form.png",
    "width": 1184,
    "height": 936,
    "alt": "Form membuat draf jadwal",
    "caption": "Cabang, nama, tanggal aktif opsional, dan status tersedia pada form draf.",
    "sourceRoute": "/admin/draft/tambah",
    "state": "draft-create-form"
  },
  "board": {
    "src": "/guides/admin/jadwal-board.png",
    "width": 1184,
    "height": 968,
    "alt": "Papan Jadwal dan panel kandidat",
    "caption": "Contoh papan pada hari yang dipilih memperlihatkan shift, kelas, murid, serta Wadah Guru.",
    "sourceRoute": "/admin/draft/[id]/board",
    "state": "schedule-board"
  },
  "classPicker": {
    "src": "/guides/admin/jadwal-kelas.png",
    "width": 1440,
    "height": 1000,
    "alt": "Dialog memilih guru dan varian kelas",
    "caption": "Tambah Kelas menampilkan guru dan varian yang tersedia untuk shift dan hari terpilih.",
    "sourceRoute": "/admin/draft/[id]/board",
    "state": "class-teacher-picker"
  },
  "classTime": {
    "src": "/guides/admin/jadwal-waktu.png",
    "width": 1440,
    "height": 1000,
    "alt": "Dialog Atur Waktu Kelas",
    "caption": "Jam selesai dihitung dari durasi varian setelah Jam Mulai ditentukan.",
    "sourceRoute": "/admin/draft/[id]/board",
    "state": "class-time-form"
  },
  "studentPicker": {
    "src": "/guides/admin/jadwal-murid.png",
    "width": 1440,
    "height": 1000,
    "alt": "Dialog Tambah Murid ke kelas",
    "caption": "Dialog nyata pada satu kelas demo sementara yang masih memiliki tempat. Tidak ada penempatan murid disimpan untuk capture.",
    "sourceRoute": "/admin/draft/[id]/board",
    "state": "student-placement-picker"
  },
  "schedulePrint": {
    "src": "/guides/admin/jadwal-cetak.png",
    "width": 1440,
    "height": 1000,
    "alt": "Pratinjau cetak jadwal guru",
    "caption": "Contoh tampilan cetak guru; tersedia pula pilihan Cetak Murid dari daftar atau papan.",
    "sourceRoute": "/print/draft/[id]",
    "state": "teacher-schedule-print"
  },
  "billingList": {
    "src": "/guides/admin/spp-filter.png", "width": 1440, "height": 1000,
    "alt": "Filter dan daftar Tagihan SPP Murid",
    "caption": "Data demo menunjukkan filter cabang/status, pencarian, penerbitan siklus, serta tindakan tiap tagihan.",
    "sourceRoute": "/admin/spp", "state": "billing-filtered-list"
  },
  "payment": {
    "src": "/guides/admin/spp-pembayaran.png", "width": 1440, "height": 1000,
    "alt": "Form Catat Pembayaran SPP",
    "caption": "Form pelunasan invoice demo. Tidak ada pembayaran baru disimpan untuk capture.",
    "sourceRoute": "/admin/spp", "state": "payment-form-unsaved"
  },
  "receipt": {
    "src": "/guides/admin/spp-kwitansi.png", "width": 1440, "height": 1000,
    "alt": "Kwitansi pembayaran demo yang sudah tercatat",
    "caption": "Kwitansi dari pembayaran demo yang sudah tersedia, dengan nomor, rincian, dan cap LUNAS.",
    "sourceRoute": "/admin/spp?status=paid", "state": "existing-paid-receipt"
  },
  "billingExport": {
    "src": "/guides/admin/spp-export.png", "width": 1440, "height": 1000,
    "alt": "Pratinjau Export Rekap SPP",
    "caption": "Rekap demo mengikuti filter halaman dan mengelompokkan murid yang memiliki lebih dari satu program.",
    "sourceRoute": "/admin/spp", "state": "grouped-recap-preview"
  },
  "payrollOpen": {
    "src": "/guides/admin/payroll-open.png", "width": 1440, "height": 1000,
    "alt": "Periode payroll terbuka",
    "caption": "Periode demo berstatus Terbuka sebelum penutupan. Angka yang ditampilkan harus dibaca bersama status periodenya.",
    "sourceRoute": "/admin/payroll", "state": "payroll-open"
  },
  "payrollClose": {
    "src": "/guides/admin/payroll-tutup.png", "width": 1440, "height": 1000,
    "alt": "Konfirmasi Penutupan Periode Payroll",
    "caption": "Panel konfirmasi ditampilkan lalu dibatalkan; tidak ada periode yang ditutup untuk capture.",
    "sourceRoute": "/admin/payroll", "state": "payroll-close-confirmation-unsent"
  },
  "payrollClosed": {
    "src": "/guides/admin/payroll-closed.png", "width": 1440, "height": 1000,
    "alt": "Periode payroll ditutup sebelum dibayar",
    "caption": "Snapshot periode demo berstatus Ditutup, dengan tindakan adjustment dan penandaan pembayaran.",
    "sourceRoute": "/admin/payroll", "state": "payroll-closed-unpaid"
  },
  "payrollAdjustment": {
    "src": "/guides/admin/payroll-penyesuaian.png", "width": 1440, "height": 1000,
    "alt": "Form Tambah Adjustment Manual pada periode tertutup",
    "caption": "Form guru, nominal bertanda, dan alasan dibuka tanpa menyimpan penyesuaian.",
    "sourceRoute": "/admin/payroll", "state": "closed-period-adjustment-form"
  },
  "payrollPaid": {
    "src": "/guides/admin/payroll-paid.png", "width": 1440, "height": 1000,
    "alt": "Periode payroll yang sudah dibayar",
    "caption": "Periode demo yang sejak awal sudah berstatus Dibayar; bukan pembayaran yang dilakukan untuk panduan.",
    "sourceRoute": "/admin/payroll", "state": "existing-paid-payroll"
  },
  "payrollNew": {
    "src": "/guides/admin/payroll-bulan-baru.png", "width": 1440, "height": 1000,
    "alt": "Form Buka Periode Payroll Bulan Baru",
    "caption": "Pemilihan bulan ditampilkan tanpa menekan Buka Periode; tidak ada periode baru dibuat untuk capture.",
    "sourceRoute": "/admin/payroll", "state": "new-period-form-unsent"
  },
  "cmsHero": {
    "src": "/guides/admin/cms-hero.png", "width": 1440, "height": 1000,
    "alt": "Editor Hero Banner dengan teks contoh yang belum disimpan",
    "caption": "Contoh input Hero Banner pada editor asli. Perubahan tidak disimpan atau diterbitkan.",
    "sourceRoute": "/admin/landing/hero", "state": "unsaved-demo-text"
  },
  "cmsPrograms": {
    "src": "/guides/admin/cms-programs.png", "width": 1440, "height": 1000,
    "alt": "Editor judul Program Belajar dan tautan Master Program",
    "caption": "Editor judul section; daftar program dikelola melalui Master Program. Teks contoh tidak disimpan.",
    "sourceRoute": "/admin/landing/programs", "state": "unsaved-demo-section-heading"
  },
  "cmsFaq": {
    "src": "/guides/admin/cms-faq.png", "width": 1440, "height": 1000,
    "alt": "Pertanyaan, slug ID, dan jawaban contoh di editor FAQ",
    "caption": "Satu item FAQ contoh pada form asli, tanpa menerbitkan perubahan daftar.",
    "sourceRoute": "/admin/landing/faq", "state": "unsaved-demo-faq"
  },
  "cmsCta": {
    "src": "/guides/admin/cms-cta.png", "width": 1440, "height": 1000,
    "alt": "Editor judul, tagline, dan teks tombol Call to Action",
    "caption": "Input ajakan konsultasi ditampilkan sebagai contoh yang belum disimpan.",
    "sourceRoute": "/admin/landing/cta", "state": "unsaved-demo-cta"
  },
  "cmsFooter": {
    "src": "/guides/admin/cms-footer.png", "width": 1440, "height": 1000,
    "alt": "Daftar media sosial dan navigasi footer dengan tautan example.com",
    "caption": "Bagian media sosial dan tautan footer menggunakan input demo yang tidak disimpan. Posisi gulir mengecualikan contoh nomor kontak asli.",
    "sourceRoute": "/admin/landing/footer", "state": "unsaved-demo-social-and-navigation"
  },
  "cmsNavbar": {
    "src": "/guides/admin/cms-navbar.png", "width": 1440, "height": 1000,
    "alt": "Editor brand, teks tombol, dan tautan navigasi header",
    "caption": "Menu Program Belajar digunakan sebagai contoh input navigasi yang belum disimpan.",
    "sourceRoute": "/admin/landing/navbar", "state": "unsaved-demo-navigation"
  },
  "cmsFloatingWa": {
    "src": "/guides/admin/cms-floating_wa.png", "width": 1440, "height": 1000,
    "alt": "Checkbox Aktifkan Tombol Floating WhatsApp",
    "caption": "Kontrol visibilitas pada editor asli; tidak ada perubahan pengaturan yang disimpan.",
    "sourceRoute": "/admin/landing/floating_wa", "state": "existing-visibility-control"
  },
  "cmsWhyUs": {
    "src": "/guides/admin/cms-why_us.png", "width": 1440, "height": 1000,
    "alt": "Judul, ikon, dan deskripsi poin keunggulan contoh",
    "caption": "Item keunggulan demo ditambahkan pada form tanpa menyimpan daftar.",
    "sourceRoute": "/admin/landing/why_us", "state": "unsaved-demo-advantage"
  },
  "cmsFacilities": {
    "src": "/guides/admin/cms-facilities.png", "width": 1440, "height": 1000,
    "alt": "Nama, ikon, dan deskripsi fasilitas contoh",
    "caption": "Contoh pengisian fasilitas pada editor asli; bukan pengumuman fasilitas baru.",
    "sourceRoute": "/admin/landing/facilities", "state": "unsaved-demo-facility"
  },
  "cmsTeam": {
    "src": "/guides/admin/cms-team.png", "width": 1440, "height": 1000,
    "alt": "Editor profil pengelola demo dengan logo lembaga sebagai contoh gambar",
    "caption": "Logo digunakan untuk mendemonstrasikan input gambar, bukan sebagai foto orang. Identitas dan teks demo tidak diterbitkan.",
    "sourceRoute": "/admin/landing/team", "state": "unsaved-demo-profile-and-logo"
  },
  "cmsGallery": {
    "src": "/guides/admin/cms-gallery.png", "width": 1440, "height": 1000,
    "alt": "Kategori galeri contoh dengan satu logo dan teks alt",
    "caption": "Kategori dan gambar contoh dibuat melalui kontrol form. Tidak ada foto anak atau perubahan tersimpan.",
    "sourceRoute": "/admin/landing/gallery", "state": "unsaved-demo-gallery-group"
  },
  "cmsTestimonials": {
    "src": "/guides/admin/cms-testimonials.png", "width": 1440, "height": 1000,
    "alt": "Editor testimoni dengan nama Orang Tua Demo dan kutipan contoh",
    "caption": "Teks secara eksplisit merupakan contoh panduan, bukan testimoni orang tua sebenarnya, dan tidak disimpan.",
    "sourceRoute": "/admin/landing/testimonials", "state": "unsaved-explicit-demo-testimonial"
  },
  "cmsVideos": {
    "src": "/guides/admin/cms-videos.png", "width": 1440, "height": 1000,
    "alt": "Editor video TikTok dengan deteksi shortlink dan tombol ekstraksi ID",
    "caption": "Shortlink CONTOH-PANDUAN hanya menunjukkan kontrol deteksi; bukan video yang dapat diputar. Ekstraksi dan publikasi tidak dijalankan.",
    "sourceRoute": "/admin/landing/videos", "state": "unsaved-demo-shortlink-control"
  },
  "cmsLocations": {
    "src": "/guides/admin/cms-locations.png", "width": 1440, "height": 1000,
    "alt": "Editor lokasi publik dengan nama dan alamat cabang demo",
    "caption": "Lokasi contoh pada CMS publik, bukan alamat cabang sebenarnya atau perubahan pada Master Cabang. Tidak disimpan.",
    "sourceRoute": "/admin/landing/locations", "state": "unsaved-demo-public-location"
  }
} as const satisfies Record<string, GuideScreenshot>;
