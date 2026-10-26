import "server-only";
import type { GuideChapter } from "@/types/guides";
import { GURU_SCREENSHOTS } from "./screenshots";

export const GURU_ATTENDANCE = {
  "id": "attendance",
  "title": "Presensi datang dan pulang",
  "articles": [
    {
      "slug": "presensi-masuk",
      "title": "Melakukan Check-In",
      "summary": "Periksa cabang tugas dan jarak GPS, lalu bedakan hasil online dari presensi yang masih berada dalam antrean.",
      "keywords": [
        "check in",
        "check-in",
        "absen masuk",
        "presensi masuk",
        "radius",
        "gps"
      ],
      "prerequisites": [
        "Akun dan penugasan cabang benar, dengan kelas aktif pada hari ini menurut jadwal sistem.",
        "Lokasi perangkat aktif/diizinkan dan Anda sungguh berada di tempat bertugas."
      ],
      "groups": [
        {
          "id": "masuk",
          "steps": [
            {
              "title": "Buka Presensi pada menu bawah",
              "paragraphs": [
                "Periksa cabang dan informasi shift/jam pada panel. Bila Pilih Lokasi Mengajar tersedia, pilih cabang yang benar; saran Terdekat (Auto) tetap perlu dicocokkan dengan tugas."
              ]
            },
            {
              "title": "Periksa jarak dan radius",
              "paragraphs": [
                "Izinkan lokasi browser/perangkat dan tunggu hasil GPS. Baca Radius toleransi serta Jarak; mendekatlah ke lokasi kerja hingga berada dalam radius yang ditetapkan admin.",
                "Contoh menggunakan posisi uji akun demo. Jangan meniru simulasi lokasi untuk presensi kerja atau menganggap semua cabang memakai radius yang sama."
              ]
            },
            {
              "title": "Pilih Check-In satu kali",
              "paragraphs": [
                "Tunggu proses, baca pesan hasil, dan periksa tombol Sudah Masuk. Bila muncul Antrean atau Mode Offline, buka panduan antrean; perubahan tombol belum membuktikan server sudah menerima presensi."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.attendance
          ]
        }
      ],
      "expected": [
        "Presensi masuk terkonfirmasi pada server, atau jelas diketahui masih menunggu sinkronisasi tanpa dicatat ulang."
      ],
      "systemRules": [
        "Cabang yang tersedia mengikuti penugasan dan jadwal hari ini; halaman bisa menampilkan keadaan tanpa jadwal/penugasan sebagai pengganti tombol presensi.",
        "Radius mengikuti konfigurasi cabang, bukan angka tetap dari contoh.",
        "Status Sudah Masuk dapat ditampilkan secara optimistis ketika record masih mengantre offline.",
        "Informasi shift adalah konteks tugas; ikuti jadwal operasional lembaga, jangan menjadikan tersedia/tidaknya tombol sebagai izin mengubah jam kerja."
      ],
      "recommendations": [
        "Presensi hanya untuk keberadaan nyata dan akun sendiri.",
        "Tunggu hasil satu tindakan sebelum mengulang agar tidak membuat catatan yang sulit ditelusuri."
      ],
      "troubleshooting": [
        {
          "question": "Di luar radius meskipun merasa sudah di cabang.",
          "answer": "Periksa cabang terpilih, izin/akurasi GPS dan jarak yang ditampilkan. Coba lokasi dengan sinyal lebih baik; bila titik/radius cabang keliru, laporkan ke admin tanpa memalsukan GPS."
        },
        {
          "question": "Sudah Masuk muncul bersama Antrean.",
          "answer": "Itu belum konfirmasi penyimpanan server. Pertahankan akun/perangkat dan ikuti langkah sinkronisasi; jangan melakukan check-in baru untuk menggantikannya."
        }
      ]
    },
    {
      "slug": "presensi-pulang",
      "title": "Melakukan Check-Out dan memeriksa hasil",
      "summary": "Check-Out mengikuti catatan masuk yang sama. Pastikan hasil terkirim, bukan sekadar tombol berubah.",
      "keywords": [
        "check out",
        "check-out",
        "absen pulang",
        "sudah pulang",
        "akhiri sesi"
      ],
      "prerequisites": [
        "Check-In sudah dicatat atau status antreannya dipahami.",
        "Tugas selesai sesuai prosedur lembaga dan lokasi perangkat masih valid."
      ],
      "groups": [
        {
          "id": "pulang",
          "steps": [
            {
              "title": "Buka kembali Presensi",
              "paragraphs": [
                "Periksa akun, cabang, koneksi, dan status masuk. Tunggu sinkronisasi Check-In terlebih dahulu saat koneksi tersedia agar Check-Out dapat merujuk catatan masuk yang benar."
              ]
            },
            {
              "title": "Pilih Check-Out setelah selesai bertugas",
              "paragraphs": [
                "Pastikan posisi/GPS sesuai lokasi tugas, lalu pilih Check-Out. Tunggu pesan berhasil atau informasi antrean; jangan menutup aplikasi selama proses belum jelas."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.checkOut
          ]
        },
        {
          "id": "hasil-pulang",
          "steps": [
            {
              "title": "Periksa Sudah Pulang dan antrean",
              "paragraphs": [
                "Periksa tombol Sudah Pulang. Jika masih ada Antrean, selesaikan sinkronisasi sebelum keluar atau menghapus data aplikasi.",
                "Saat online dan antrean selesai, muat ulang untuk memeriksa status yang dibaca dari server. Bila data tetap tidak sesuai, laporkan waktu, cabang, akun, dan pesan yang tampil."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.completedAttendance
          ]
        }
      ],
      "expected": [
        "Catatan masuk yang benar memiliki waktu pulang tersimpan dan tidak meninggalkan antrean yang belum dipahami."
      ],
      "systemRules": [
        "Check-Out tidak tersedia sebelum status masuk dan tidak digunakan untuk mencatat pembayaran honor.",
        "Saat jaringan terputus, data dapat menunggu sinkronisasi lokal; label Sudah Pulang saja tidak cukup sebagai bukti server.",
        "Presensi datang/pulang tidak mengirim kartu mengajar secara otomatis."
      ],
      "recommendations": [
        "Selesaikan kartu mengajar melalui alurnya sendiri dan periksa antrean sebelum keluar akun."
      ],
      "troubleshooting": [
        {
          "question": "Check-Out tidak aktif.",
          "answer": "Periksa apakah status masuk sudah ada, proses/sinkronisasi sedang berlangsung, atau pulang memang sudah tercatat. Jangan membuat check-in baru tanpa memeriksa data yang ada."
        },
        {
          "question": "Muncul Menunggu sinkronisasi Check-in.",
          "answer": "Pulihkan jaringan pada akun/perangkat yang sama dan tunggu antrean masuk terkirim. Bila tetap gagal, simpan informasi pesan dan hubungi admin tanpa menghapus data situs."
        }
      ]
    },
    {
      "slug": "presensi-gps-libur",
      "title": "Menangani GPS, penugasan, dan Hari Ini Libur",
      "summary": "Tidak semua keadaan tanpa tombol presensi adalah masalah internet. Baca pesan untuk mengetahui data atau izin yang harus diperiksa.",
      "keywords": [
        "gps diblokir",
        "izin lokasi",
        "hari ini libur",
        "cabang belum diatur",
        "penugasan berbeda",
        "gagal memuat jadwal",
        "radius"
      ],
      "prerequisites": [
        "Identitas akun benar dan perangkat dapat membuka halaman online saat pemeriksaan."
      ],
      "groups": [
        {
          "id": "izin-gps",
          "steps": [
            {
              "title": "Baca pesan izin lokasi",
              "paragraphs": [
                "Jika Izin Lokasi GPS Belum Aktif muncul, aktifkan layanan lokasi perangkat dan izin lokasi untuk situs ini di pengaturan browser."
              ]
            },
            {
              "title": "Coba Minta Izin GPS Ulang",
              "paragraphs": [
                "Setelah izin diperbaiki, pilih Coba Minta Izin GPS Ulang dan tunggu hasil. Bila browser/perangkat tidak mendukung geolokasi, gunakan perangkat yang mendukung; jangan memalsukan lokasi."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.gps
          ]
        },
        {
          "id": "jadwal-dan-penugasan",
          "steps": [
            {
              "title": "Bedakan Hari Ini Libur dari data tugas yang belum benar",
              "paragraphs": [
                "Hari Ini Libur berarti sistem tidak menemukan jadwal aktif untuk akun itu hari ini. Jika Anda seharusnya bertugas, hubungi admin dengan kelas, cabang, hari dan jamnya."
              ]
            },
            {
              "title": "Laporkan pesan penugasan atau kegagalan data",
              "paragraphs": [
                "Cabang Penugasan Belum Diatur dan Cabang Penugasan Berbeda memerlukan pemeriksaan admin pada penugasan/jadwal. Gagal Memuat Jadwal adalah kegagalan pembacaan data; muat ulang saat koneksi stabil dan laporkan bila berlanjut.",
                "Jangan mengubah tanggal perangkat atau memakai akun rekan agar tombol muncul."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.dayOff
          ]
        }
      ],
      "expected": [
        "Izin GPS dipulihkan atau masalah penugasan/jadwal disampaikan dengan detail yang tepat tanpa membuat presensi palsu."
      ],
      "systemRules": [
        "Pemeriksaan jadwal hari ini pada halaman presensi menggunakan tanggal/hari WIB.",
        "Peta/alamat publik pada website bukan pengaturan titik/radius presensi operasional.",
        "Guru tidak memperbaiki penugasan cabang dengan mengubah profil pribadi atau CMS."
      ],
      "recommendations": [
        "Buka situs resmi melalui koneksi aman dan periksa izin pada browser yang benar, terutama setelah mengganti perangkat."
      ],
      "troubleshooting": [
        {
          "question": "Izin sudah diberikan tetapi lokasi belum stabil.",
          "answer": "Tunggu GPS, aktifkan lokasi presisi bila tersedia, pindah ke area bersinyal baik dan periksa cabang terpilih. Jangan menekan presensi berulang saat koordinat belum jelas."
        },
        {
          "question": "Jadwal seharusnya ada tetapi Hari Ini Libur tetap tampil.",
          "answer": "Laporkan akun, tanggal WIB, cabang, kelas dan jam kepada admin agar jadwal aktif serta penugasannya diperiksa. Keadaan ini tidak diselesaikan dengan mengubah jam/tanggal perangkat."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
