import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_PROGRAMS = {
  "id": "programs",
  "title": "Program dan varian belajar",
  "articles": [
    {
      "slug": "program-varian",
      "title": "Membuat program dan varian belajar",
      "summary": "Pisahkan identitas program dari aturan tiap varian: durasi, kapasitas, frekuensi, SPP, dan honor guru.",
      "keywords": [
        "program baru",
        "varian",
        "durasi",
        "frekuensi",
        "kapasitas",
        "rasio",
        "honor",
        "SPP",
        "lisensi"
      ],
      "prerequisites": [
        "Informasi program dan ketentuan varian sudah disepakati pengelola.",
        "Siapkan materi publik yang memang boleh muncul di landing page."
      ],
      "groups": [
        {
          "id": "program",
          "steps": [
            {
              "title": "Isi identitas master program",
              "paragraphs": [
                "Buka Program Belajar dan form tambah. Isi Inisial Program, Nama Lengkap Program, Kategori / Tipe Program, serta Urutan Tampil bila perlu. Lengkapi Tagline Singkat, Deskripsi Program, Target Usia Murid, dan ikon yang sesuai."
              ]
            },
            {
              "title": "Lengkapi informasi lisensi bila relevan",
              "paragraphs": [
                "Untuk program berlisensi, isi informasi lembaga, tautan resmi, keterangan, dan aset lisensi yang tersedia pada form. Jangan mengklaim lisensi yang tidak dimiliki."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.programForm
          ]
        },
        {
          "id": "varian",
          "steps": [
            {
              "title": "Tambahkan varian yang benar",
              "paragraphs": [
                "Pilih Tambah Varian bila ada lebih dari satu paket. Isi Nama Varian, Durasi (Menit), Frekuensi (/minggu), dan Sistem (Maks Murid).",
                "Durasi adalah lama satu sesi, frekuensi adalah jatah pertemuan mingguan, sedangkan Sistem membatasi jumlah murid dalam satu kelas."
              ]
            },
            {
              "title": "Atur biaya dan tampilan",
              "paragraphs": [
                "Isi Default SPP (Rp) dan Honor Guru per Sesi (Rp). Periksa status varian serta Tampil di Landing Page. Tambahkan fasilitas yang benar lewat Tambah Fasilitas."
              ]
            },
            {
              "title": "Simpan dan periksa detail",
              "paragraphs": [
                "Pilih Simpan Program, kemudian buka detailnya untuk memeriksa setiap varian, biaya, dan status sebelum digunakan untuk enrollment atau jadwal."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.programList
          ]
        }
      ],
      "expected": [
        "Program dan semua varian yang dimaksud tampil pada detail Program Belajar."
      ],
      "systemRules": [
        "Durasi, frekuensi, dan kapasitas harus bernilai positif sesuai validasi form.",
        "Kapasitas serta frekuensi varian dipakai pada validasi penempatan murid.",
        "Nominal SPP tersimpan pula pada enrollment murid; Default SPP program tidak boleh dianggap selalu sama dengan tagihan setiap murid."
      ],
      "recommendations": [
        "Gunakan nama varian yang membantu admin membedakan paket, bukan hanya nomor urut.",
        "Periksa angka dan satuan sebelum menyimpan; nominal dalam rupiah, bukan ribuan rupiah."
      ],
      "troubleshooting": [
        {
          "question": "Varian tidak muncul saat menyusun kelas.",
          "answer": "Periksa status varian, program yang ditugaskan kepada guru, serta filter program pada papan jadwal."
        },
        {
          "question": "Murid mendapat nominal berbeda dari Default SPP.",
          "answer": "Buka enrollment murid dan periksa Nominal SPP, varian, diskon, serta siklusnya. Jangan menganggap perubahan default otomatis membetulkan seluruh enrollment atau invoice lama."
        }
      ]
    },
    {
      "slug": "program-edit-status",
      "title": "Mengedit varian dan status program",
      "summary": "Perbarui master yang tepat tanpa memutus referensi varian yang sudah dipakai murid atau kelas.",
      "keywords": [
        "edit program",
        "hapus varian",
        "aktif program",
        "nonaktif",
        "fasilitas",
        "landing"
      ],
      "prerequisites": [
        "Ketahui program dan varian yang dipakai data operasional.",
        "Periksa dampak perubahan pada enrollment, jadwal, dan konten publik."
      ],
      "groups": [
        {
          "id": "edit",
          "steps": [
            {
              "title": "Buka program yang akan diperbarui",
              "paragraphs": [
                "Cari program pada Program Belajar, buka detailnya, lalu Edit. Cocokkan nama varian sebelum mengubah durasi, frekuensi, kapasitas, SPP, atau honor."
              ]
            },
            {
              "title": "Perbarui varian yang sama jika masih digunakan",
              "paragraphs": [
                "Ubah baris varian yang sesuai. Hapus varian hanya bila benar-benar tidak dipakai dan sistem mengizinkannya; jangan menghapus lalu membuat ulang hanya untuk mengganti nama atau biaya."
              ]
            },
            {
              "title": "Tinjau status dan konten publik",
              "paragraphs": [
                "Periksa status aktif dan pilihan Tampil di Landing Page pada varian. Gunakan tindakan status program untuk mengaktifkan/menonaktifkan sesuai kebutuhan; baca konfirmasinya."
              ]
            },
            {
              "title": "Simpan lalu verifikasi",
              "paragraphs": [
                "Gunakan tombol simpan pada form. Periksa detail program dan hasil tampilan publik bila pengaturan landing page berubah."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.programForm
          ],
          "warning": "Perubahan master dapat memengaruhi pilihan operasional berikutnya. Jangan menghapus varian yang sedang menjadi referensi enrollment atau kelas untuk menghindari pesan validasi."
        }
      ],
      "expected": [
        "Perubahan tersimpan pada program/varian yang benar dan referensi operasional tetap utuh."
      ],
      "systemRules": [
        "Varian yang masih direferensikan dapat ditolak penghapusannya. Ikuti pesan sistem; jangan memaksa lewat pengubahan database.",
        "Status operasional varian dan pilihan tampil di landing page adalah pengaturan yang berbeda."
      ],
      "recommendations": [
        "Periksa enrollment murid dan jadwal yang memakai varian sebelum mengganti ketentuan paket."
      ],
      "troubleshooting": [
        {
          "question": "Penghapusan varian ditolak.",
          "answer": "Masih ada data yang mereferensikan varian tersebut. Pertahankan varian yang dipakai dan periksa kebutuhan operasional; jangan menghapus referensi murid atau riwayat hanya untuk melewati batasan."
        },
        {
          "question": "Perubahan tidak terlihat di website.",
          "answer": "Periksa apakah varian aktif dan diizinkan tampil, lalu periksa pengaturan bagian Programs pada CMS dan muat ulang halaman publik."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
