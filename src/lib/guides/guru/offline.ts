import "server-only";
import type { GuideChapter } from "@/types/guides";
import { GURU_SCREENSHOTS } from "./screenshots";

export const GURU_OFFLINE = {
  "id": "offline",
  "title": "Koneksi dan antrean presensi",
  "articles": [
    {
      "slug": "presensi-antrean-offline",
      "title": "Menjaga dan menyinkronkan antrean offline",
      "summary": "Antrean adalah data lokal yang belum terkonfirmasi server. Jangan menghapusnya atau mengganti akun/perangkat sebelum hasilnya jelas.",
      "keywords": [
        "offline",
        "antrean",
        "antrian",
        "sinkron",
        "indexeddb",
        "koneksi terputus",
        "sudah masuk",
        "data lokal"
      ],
      "prerequisites": [
        "Halaman presensi dan data tugas sudah dapat dibuka pada perangkat yang sama.",
        "Akun yang digunakan masih akun pemilik antrean."
      ],
      "groups": [
        {
          "id": "antrean",
          "steps": [
            {
              "title": "Baca Mode Offline dan jumlah Antrean",
              "paragraphs": [
                "Saat penyimpanan online gagal atau jaringan terputus, presensi dapat masuk antrean lokal. Periksa pesan yang muncul dan jumlah Antrean.",
                "Sudah Masuk/Sudah Pulang dapat berubah meskipun data masih lokal. Screenshot menunjukkan satu antrean asli yang saat capture belum ada pada server."
              ]
            },
            {
              "title": "Pertahankan data pada perangkat asal",
              "paragraphs": [
                "Jangan keluar/ganti akun, mencopot aplikasi, membersihkan cache/data situs, atau memakai mode privat lalu menutup sesinya saat antrean belum selesai. Jangan membuat presensi baru dari perangkat lain sebagai pengganti."
              ]
            },
            {
              "title": "Pulihkan jaringan dan tunggu sinkronisasi",
              "paragraphs": [
                "Gunakan akun/browser/perangkat yang sama, kembali ke halaman presensi dan pastikan Mode Online. Aplikasi mencoba mengirim antrean akun itu ketika online. Tunggu jumlah Antrean berkurang/hilang dan pesan hasilnya."
              ]
            },
            {
              "title": "Periksa keadaan server setelah antrean selesai",
              "paragraphs": [
                "Saat sinkronisasi sudah selesai dan jaringan stabil, muat ulang lalu periksa status presensi. Jika antrean tetap ada atau pesan kegagalan berulang, catat waktu, cabang, jumlah antrean dan pesan untuk dilaporkan kepada admin."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.queue
          ],
          "warning": "Jangan menghapus data situs atau keluar akun sebagai langkah pertama mengatasi antrean. Tindakan itu dapat menghilangkan satu-satunya catatan yang belum terkirim."
        }
      ],
      "expected": [
        "Antrean akun yang benar terkirim dan status dibaca kembali dari server, atau data lokal tetap terjaga saat kegagalan dilaporkan."
      ],
      "systemRules": [
        "Antrean yang dibahas adalah presensi datang/pulang, bukan penyimpanan offline semua halaman atau kartu mengajar.",
        "Data disimpan di IndexedDB browser/perangkat asal dan sinkronisasi dipisahkan menurut guru yang sedang masuk.",
        "Mode Online hanya menunjukkan konektivitas perangkat; bukan bukti semua antrean telah berhasil diterima.",
        "Halaman/data yang belum dimuat online belum tentu bisa dibuka pertama kali saat offline."
      ],
      "recommendations": [
        "Selesaikan sinkronisasi sebelum berganti akun atau perangkat, dan hindari mode privat untuk tugas presensi.",
        "Jika pesan penolakan data/akses muncul, laporkan penyebabnya; jangan mematikan jaringan untuk mencoba melewati aturan."
      ],
      "troubleshooting": [
        {
          "question": "Internet sudah hidup tetapi antrean belum habis.",
          "answer": "Tetap pada akun/perangkat asal, periksa pesan dan tunggu proses sinkronisasi. Koneksi online tidak menjamin server menerima data yang ditolak. Laporkan antrean yang tertahan tanpa menghapus penyimpanan."
        },
        {
          "question": "Antrean tidak terlihat di ponsel lain.",
          "answer": "Data lokal tidak otomatis berpindah perangkat/browser. Periksa perangkat asal dengan akun pemiliknya; jangan menyimpulkan data sudah tersinkron karena perangkat baru tidak menampilkannya."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
