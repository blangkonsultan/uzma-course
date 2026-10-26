import "server-only";
import type { GuideChapter } from "@/types/guides";
import { GURU_SCREENSHOTS } from "./screenshots";

export const GURU_GETTING_STARTED = {
  "id": "getting-started",
  "title": "Mulai menggunakan portal",
  "articles": [
    {
      "slug": "mulai",
      "title": "Masuk dan mengenali portal guru",
      "summary": "Gunakan akun pribadi yang disiapkan admin. Jadwal, presensi, kartu mengajar dan honor memiliki fungsi yang berbeda.",
      "keywords": [
        "login",
        "masuk",
        "akun guru",
        "beranda",
        "panduan",
        "menu",
        "mulai"
      ],
      "prerequisites": [
        "Akun guru aktif dan kredensial pribadi sudah diterima dari admin.",
        "Gunakan perangkat/browser tepercaya dan koneksi saat pertama membuka portal."
      ],
      "groups": [
        {
          "id": "masuk",
          "steps": [
            {
              "title": "Buka halaman Masuk ke Portal",
              "paragraphs": [
                "Buka website resmi lembaga, lalu halaman /login. Isi Email dan Kata Sandi milik Anda, kemudian pilih Masuk ke Portal. Jangan memakai akun demo pada screenshot sebagai akun kerja."
              ]
            },
            {
              "title": "Periksa Beranda dan identitas akun",
              "paragraphs": [
                "Setelah masuk, periksa nama pada Beranda serta Profil. Jika nama/akses tidak sesuai, jangan mencatat presensi atau kartu atas nama akun itu; laporkan kepada admin."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.login,
            GURU_SCREENSHOTS.home
          ]
        },
        {
          "id": "menu",
          "steps": [
            {
              "title": "Gunakan lima menu bawah",
              "paragraphs": [
                "Beranda merangkum aktivitas; Jadwal menampilkan kelas/murid dan akses kartu mengajar; Presensi mencatat datang/pulang; Honor menampilkan rekap pribadi; Profil memuat akun, kata sandi, notifikasi dan keluar."
              ]
            },
            {
              "title": "Buka panduan dari Profil",
              "paragraphs": [
                "Pilih Profil → Panduan Pengguna. Gunakan Daftar isi panduan atau Cari topik panduan, lalu buka tugas yang akan dilakukan. Perbesar screenshot untuk membaca detail dan gunakan Cetak panduan bila memerlukan artikel tersebut."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.profile
          ]
        }
      ],
      "expected": [
        "Identitas akun benar dan Anda dapat menemukan menu sesuai pekerjaan tanpa masuk ke halaman admin."
      ],
      "systemRules": [
        "Akun guru didaftarkan/dikelola oleh admin; halaman login bukan pendaftaran akun baru.",
        "Presensi datang/pulang berbeda dari status kehadiran murid pada kartu mengajar.",
        "Panduan guru terpisah dari panduan admin; tautan topik yang tidak dikenal kembali ke topik mulai milik guru."
      ],
      "recommendations": [
        "Jangan berbagi kata sandi atau memakai akun rekan untuk mencatat aktivitas.",
        "Screenshot menggunakan data demo, bukan target murid, kontak, atau transaksi untuk dicoba."
      ],
      "troubleshooting": [
        {
          "question": "Tidak dapat masuk atau akun tidak aktif.",
          "answer": "Periksa email, kata sandi dan koneksi. Bila masih gagal, hubungi admin untuk status akun/akses; jangan membuat akun baru atau menebak kata sandi berulang-ulang."
        },
        {
          "question": "Halaman yang terbuka bukan portal guru saya.",
          "answer": "Periksa identitas akun, selesaikan sinkronisasi presensi yang tertunda, lalu keluar dengan aman dan masuk menggunakan akun yang benar."
        }
      ]
    },
    {
      "slug": "pasang-pwa",
      "title": "Memasang pintasan aplikasi di ponsel",
      "summary": "Pemasangan bergantung browser/perangkat. Portal tetap dapat dibuka melalui browser jika pilihan instalasi tidak tersedia.",
      "keywords": [
        "pwa",
        "install",
        "instal",
        "android",
        "ios",
        "iphone",
        "layar utama",
        "home screen"
      ],
      "prerequisites": [
        "Website resmi sudah dapat dibuka online melalui browser yang mendukung.",
        "Pastikan tidak ada antrean presensi yang belum tersinkron sebelum berganti browser/perangkat."
      ],
      "groups": [
        {
          "id": "pasang",
          "steps": [
            {
              "title": "Buka portal melalui browser yang biasa dipakai",
              "paragraphs": [
                "Pastikan alamat website resmi dan login bekerja. Gunakan browser/perangkat yang sama untuk aktivitas rutin agar data antrean lokal tidak tersebar."
              ]
            },
            {
              "title": "Gunakan pilihan pemasangan yang tersedia",
              "paragraphs": [
                "Pada Android/browser yang mendukung, periksa menu Instal aplikasi, Install app, atau Tambahkan ke layar utama bila tersedia.",
                "Pada iPhone/iPad dengan browser yang menyediakan pilihan tersebut, gunakan menu berbagi lalu Add to Home Screen / Tambahkan ke Layar Utama. Nama/letak menu berbeda menurut versi perangkat dan browser; panduan ini tidak menampilkan screenshot OS buatan."
              ]
            },
            {
              "title": "Buka kembali dari ikon dan periksa akun",
              "paragraphs": [
                "Setelah pintasan/aplikasi terpasang, buka ikonnya dan pastikan halaman serta akun yang benar tampil. Bila diminta masuk lagi, gunakan akun sendiri. Jika pilihan pemasangan tidak ada, gunakan bookmark/browser yang sama."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.home
          ]
        }
      ],
      "expected": [
        "Portal dapat dibuka dari ikon/pintasan bila didukung, atau tetap digunakan lewat browser tanpa mengubah alur kerja."
      ],
      "systemRules": [
        "Tidak semua browser/perangkat menampilkan tombol instalasi yang sama.",
        "Pemasangan tidak otomatis memberi izin GPS/notifikasi atau membuat seluruh halaman dapat digunakan offline.",
        "Antrean presensi tersimpan pada penyimpanan browser/perangkat asal, bukan otomatis pindah karena memasang aplikasi lain."
      ],
      "recommendations": [
        "Hindari mode privat/incognito untuk pekerjaan yang mungkin memiliki antrean offline karena data dapat hilang saat sesi ditutup.",
        "Jangan menghapus data situs, mencopot aplikasi, atau mengganti perangkat sebelum antrean terkonfirmasi terkirim."
      ],
      "troubleshooting": [
        {
          "question": "Tidak menemukan menu instalasi.",
          "answer": "Periksa dukungan dan menu browser/perangkat. Anda dapat tetap membuka portal di browser; tidak ada keharusan mencari tombol instalasi universal di dalam Profil."
        },
        {
          "question": "Setelah memasang, akun meminta login lagi.",
          "answer": "Periksa apakah aplikasi menggunakan penyimpanan/browser berbeda. Jangan menganggap antrean dari browser lama sudah pindah; selesaikan sinkronisasi pada perangkat asal terlebih dahulu."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
