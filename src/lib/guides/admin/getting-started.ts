import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_GETTING_STARTED = {
  "id": "getting-started",
  "title": "Mulai menggunakan portal",
  "articles": [
    {
      "slug": "mulai",
      "title": "Masuk dan mengenali portal admin",
      "summary": "Gunakan akun admin untuk membuka area pengelolaan. Panduan ini mengikuti menu dan aturan yang tersedia pada aplikasi.",
      "keywords": [
        "login",
        "akun",
        "dashboard",
        "awal",
        "masuk"
      ],
      "prerequisites": [
        "Akun Anda sudah diberikan peran admin.",
        "Buka alamat aplikasi yang benar pada browser; jangan menggunakan tautan login dari sumber yang tidak dikenal."
      ],
      "groups": [
        {
          "id": "masuk",
          "steps": [
            {
              "title": "Buka halaman login",
              "paragraphs": [
                "Buka /login pada alamat aplikasi Uzma Course. Isi Email dan Kata Sandi milik Anda, lalu pilih Masuk ke Portal.",
                "Jika browser menampilkan isian wajib atau aplikasi menampilkan kesalahan, selesaikan pesan tersebut sebelum melanjutkan."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.login
          ]
        },
        {
          "id": "orientasi",
          "steps": [
            {
              "title": "Periksa bahwa Anda berada di portal admin",
              "paragraphs": [
                "Setelah berhasil masuk, kenali Dashboard dan kelompok Menu Utama, Data Master, Operasional & Keuangan, Konten & Website, serta Bantuan.",
                "Ringkasan guru, murid, dan program mengikuti data yang tersimpan. Nilai pada screenshot adalah contoh data demo, bukan target operasional."
              ]
            },
            {
              "title": "Buka panduan sesuai pekerjaan",
              "paragraphs": [
                "Pilih Panduan Pengguna pada kelompok Bantuan. Gunakan daftar isi untuk membuka tugas tertentu; Anda tidak perlu membaca seluruh panduan secara berurutan."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.dashboard
          ]
        }
      ],
      "expected": [
        "Dashboard admin terbuka dan menu pengelolaan dapat diakses sesuai peran.",
        "Panduan Admin dapat dibuka melalui Bantuan → Panduan Pengguna."
      ],
      "systemRules": [
        "Halaman admin memerlukan sesi login dan peran admin. Akun guru diarahkan ke area guru; mengganti alamat URL tidak mengubah hak akses."
      ],
      "recommendations": [
        "Jangan membagikan kata sandi atau menggunakan akun orang lain.",
        "Screenshot panduan menggunakan data demo; isilah formulir kerja dengan data yang telah diperiksa, bukan menyalin contoh."
      ],
      "troubleshooting": [
        {
          "question": "Mengapa saya kembali ke halaman login?",
          "answer": "Sesi mungkin sudah berakhir. Masuk kembali dengan akun sendiri, lalu buka menu yang dibutuhkan. Jika pesan login tetap muncul, laporkan pesan dan waktu kejadian kepada pengelola akun."
        },
        {
          "question": "Saya justru diarahkan ke portal guru.",
          "answer": "Periksa akun yang digunakan. Pengalihan mengikuti peran akun; hubungi pengelola akun bila penetapan perannya tidak sesuai. Jangan mencoba memakai akun milik staf lain."
        }
      ]
    },
    {
      "slug": "navigasi-filter",
      "title": "Mencari data dan membaca panduan",
      "summary": "Temukan data yang tepat sebelum melakukan perubahan. Filter halaman dan pencarian topik panduan memiliki fungsi yang berbeda.",
      "keywords": [
        "cari",
        "filter",
        "cabang",
        "status",
        "detail",
        "edit",
        "screenshot",
        "zoom"
      ],
      "prerequisites": [
        "Anda sudah masuk sebagai admin.",
        "Ketahui nama, cabang, atau status data yang ingin diperiksa."
      ],
      "groups": [
        {
          "id": "cari-data",
          "steps": [
            {
              "title": "Buka modul lalu gunakan filter yang tersedia",
              "paragraphs": [
                "Pilih modul melalui menu samping. Gunakan pencarian dan filter Status atau Cabang yang memang tersedia pada halaman tersebut.",
                "Pada daftar guru, penempatan cabang dapat mencakup cabang utama dan penugasan tambahan. Periksa filter aktif sebelum menyimpulkan data hilang."
              ]
            },
            {
              "title": "Periksa Detail sebelum Edit atau mengubah status",
              "paragraphs": [
                "Pilih Detail atau nama data untuk membaca informasi tersimpan. Gunakan Edit hanya ketika perubahan memang diperlukan. Di HP, informasi dapat tampil sebagai kartu, bukan tabel lebar."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.branchList
          ]
        },
        {
          "id": "baca-panduan",
          "steps": [
            {
              "title": "Cari topik, bukan data operasional",
              "paragraphs": [
                "Kolom Cari topik panduan menyaring daftar isi panduan berdasarkan nama dan kata kunci tugas. Pencarian ini tidak mencari murid, guru, atau transaksi di database.",
                "Di HP, buka Daftar isi panduan terlebih dahulu. Gunakan Hapus pencarian bila tidak ada topik yang cocok."
              ]
            },
            {
              "title": "Perbesar gambar bila perlu",
              "paragraphs": [
                "Pilih Perbesar screenshot untuk membuka gambar. Gunakan Ukuran asli agar rincian dapat dibaca dan geser gambar di dalam pembaca. Pilih Sesuaikan layar untuk kembali ke tampilan yang muat.",
                "Pilih Tutup screenshot atau tekan Escape untuk kembali. Tombol Sebelumnya dan Selanjutnya berpindah ke tugas di panduan, bukan mengubah data aplikasi."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.dashboard
          ]
        }
      ],
      "expected": [
        "Daftar data menampilkan hasil sesuai filter halaman.",
        "Topik panduan yang dipilih terbuka tanpa menyimpan atau mengubah data operasional."
      ],
      "systemRules": [
        "Filter halaman hanya menentukan data yang ditampilkan; menjalankan pencarian bukan tindakan simpan.",
        "Pencarian topik hanya mencakup panduan untuk peran yang sedang dibuka."
      ],
      "recommendations": [
        "Hapus filter yang tidak lagi dibutuhkan sebelum mencari data di cabang lain.",
        "Baca Sebelum mulai dan Aturan sistem pada tutorial sebelum memilih tindakan yang mengubah data."
      ],
      "troubleshooting": [
        {
          "question": "Data yang saya cari tidak muncul.",
          "answer": "Periksa kata pencarian, cabang, dan status yang aktif. Coba kosongkan filter. Jika masih tidak ditemukan, pastikan data memang sudah tersimpan dan penempatan/enrollment-nya sesuai."
        },
        {
          "question": "Topik panduan tidak ditemukan.",
          "answer": "Pilih Hapus pencarian, kemudian coba kata yang lebih singkat atau nama modulnya. Ini tidak memengaruhi data maupun filter pada modul operasional."
        }
      ]
    },
    {
      "slug": "keluar",
      "title": "Keluar dengan aman dari portal admin",
      "summary": "Akhiri sesi ketika pekerjaan selesai, terutama pada perangkat bersama.",
      "keywords": [
        "logout",
        "keluar",
        "keamanan",
        "sesi"
      ],
      "prerequisites": [
        "Pastikan perubahan formulir yang diperlukan sudah berhasil disimpan."
      ],
      "groups": [
        {
          "id": "akhiri-sesi",
          "steps": [
            {
              "title": "Periksa hasil pekerjaan sebelum keluar",
              "paragraphs": [
                "Buka kembali detail data atau hasil transaksi bila perlu. Isian yang baru diketik tetapi belum disimpan tidak boleh dianggap sudah tercatat."
              ]
            },
            {
              "title": "Pilih Keluar",
              "paragraphs": [
                "Gunakan Keluar pada area akun di menu samping atau tombol keluar di bilah atas. Tunggu sampai aplikasi kembali ke halaman login sebelum meninggalkan perangkat."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.dashboard
          ]
        }
      ],
      "expected": [
        "Sesi admin berakhir dan halaman yang dilindungi meminta login kembali."
      ],
      "systemRules": [
        "Keluar mengakhiri sesi akun; tombol ini bukan penghapusan data master atau transaksi."
      ],
      "recommendations": [
        "Jangan menyimpan kata sandi pada browser perangkat bersama.",
        "Jangan menghapus data situs sebagai cara berganti akun pada perangkat yang mungkin masih memiliki antrean presensi guru belum tersinkron."
      ],
      "troubleshooting": [
        {
          "question": "Formulir saya belum selesai.",
          "answer": "Simpan hanya bila isi sudah benar, atau batalkan perubahan dengan sadar sebelum keluar. Jangan meninggalkan formulir berisi data pribadi pada perangkat bersama."
        },
        {
          "question": "Saya masih melihat tampilan lama setelah keluar.",
          "answer": "Pastikan proses keluar selesai dan muat ulang halaman yang dilindungi. Jika akses tetap terbuka, hentikan penggunaan perangkat bersama dan laporkan kepada pengelola aplikasi."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
