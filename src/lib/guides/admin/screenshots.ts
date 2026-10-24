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
  }
} as const satisfies Record<string, GuideScreenshot>;
