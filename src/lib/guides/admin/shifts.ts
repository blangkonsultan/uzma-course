import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_SHIFTS = {
  "id": "shifts",
  "title": "Shift operasional",
  "articles": [
    {
      "slug": "shift-tambah-edit",
      "title": "Membuat atau memperbarui shift",
      "summary": "Shift menyediakan batas jam untuk kelas di cabang yang dipilih; jam kelas harus tetap berada di dalamnya.",
      "keywords": [
        "jam",
        "shift",
        "sesi",
        "waktu",
        "cabang",
        "sempit"
      ],
      "prerequisites": [
        "Cabang yang sesuai sudah tersedia.",
        "Jam operasional dan dampaknya pada kelas yang sudah disusun telah diperiksa."
      ],
      "groups": [
        {
          "id": "isi-shift",
          "steps": [
            {
              "title": "Pilih cabang dan shift yang benar",
              "paragraphs": [
                "Buka Data Shift. Pilih tambah untuk shift baru, atau Edit pada baris shift yang akan diubah. Pastikan Cabang dan Nama Shift (Sesi) sesuai."
              ]
            },
            {
              "title": "Isi rentang waktu",
              "paragraphs": [
                "Isi Jam Mulai dan Jam Selesai. Jam Mulai harus lebih awal dari Jam Selesai. Periksa format jam browser dan jangan memasukkan jam akhir yang melewati awal hari tanpa dukungan sistem."
              ]
            },
            {
              "title": "Simpan dan periksa daftar",
              "paragraphs": [
                "Pilih Simpan Shift untuk data baru atau Simpan Perubahan pada edit. Periksa jam serta cabangnya di daftar sebelum menyusun kelas."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.shiftForm
          ],
          "warning": "Mempersempit shift yang sudah berisi kelas dapat ditolak. Periksa alokasi kelas terlebih dahulu; jangan mengubah jam hanya untuk menutupi konflik."
        }
      ],
      "expected": [
        "Daftar Data Shift menampilkan cabang, nama, dan rentang waktu yang sudah diperiksa."
      ],
      "systemRules": [
        "Jam mulai harus lebih awal dari jam selesai.",
        "Kelas harus berada di dalam batas shift. Penyempitan ditolak bila membuat kelas yang sudah ada berada di luar batas tersebut."
      ],
      "recommendations": [
        "Gunakan nama shift yang jelas dan periksa cabangnya, terutama bila nama sama digunakan di beberapa cabang."
      ],
      "troubleshooting": [
        {
          "question": "Jam selesai ditolak.",
          "answer": "Periksa urutan dan format waktu. Rentang yang sama, terbalik, atau tidak valid harus diperbaiki sesuai pesan form."
        },
        {
          "question": "Perubahan jam ditolak karena ada kelas.",
          "answer": "Buka draf/papan jadwal yang memakai shift tersebut dan periksa sesi yang terdampak. Susun perubahan operasional dengan benar sebelum mempersempit batas shift."
        }
      ]
    },
    {
      "slug": "shift-status",
      "title": "Mengubah status aktif shift",
      "summary": "Aktifkan shift yang akan digunakan dan nonaktifkan hanya setelah meninjau alokasi operasionalnya.",
      "keywords": [
        "aktif shift",
        "nonaktif shift",
        "status sesi"
      ],
      "prerequisites": [
        "Anda mengetahui cabang dan shift yang akan diubah."
      ],
      "groups": [
        {
          "id": "status-shift",
          "steps": [
            {
              "title": "Temukan baris yang sesuai",
              "paragraphs": [
                "Buka Data Shift dan gunakan filter yang tersedia. Cocokkan nama, cabang, dan jam; jangan hanya mengandalkan nama shift."
              ]
            },
            {
              "title": "Gunakan tindakan status",
              "paragraphs": [
                "Pilih ikon daya untuk status yang dituju. Baca konfirmasi dan pesan sistem sebelum menerapkannya. Batalkan bila masih ada alokasi yang belum ditinjau."
              ]
            },
            {
              "title": "Periksa hasil dan ketersediaan",
              "paragraphs": [
                "Pastikan badge status berubah sesuai tujuan. Periksa kembali pilihan shift di papan jadwal untuk cabang tersebut."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.shiftList
          ]
        }
      ],
      "expected": [
        "Status shift sesuai konfirmasi dan ketersediaannya pada alur penjadwalan telah diperiksa."
      ],
      "systemRules": [
        "Papan jadwal mengambil shift aktif untuk cabang draf.",
        "Mengubah status bukan penghapusan riwayat kelas."
      ],
      "recommendations": [
        "Koordinasikan perubahan shift sebelum guru dan murid memakai jadwal yang baru."
      ],
      "troubleshooting": [
        {
          "question": "Shift tidak muncul di papan jadwal.",
          "answer": "Periksa cabang draf, status aktif shift, dan filter yang sedang digunakan. Muat ulang papan setelah perubahan tersimpan."
        },
        {
          "question": "Tindakan gagal atau status belum jelas.",
          "answer": "Baca pesan sistem lalu muat ulang daftar untuk memeriksa keadaan tersimpan sebelum mengulang konfirmasi."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
