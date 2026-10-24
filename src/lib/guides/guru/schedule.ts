import "server-only";
import type { GuideChapter } from "@/types/guides";
import { GURU_SCREENSHOTS } from "./screenshots";

export const GURU_SCHEDULE = {
  "id": "schedule",
  "title": "Jadwal dan daftar murid",
  "articles": [
    {
      "slug": "jadwal-harian",
      "title": "Memeriksa jadwal harian lintas cabang",
      "summary": "Pilih hari, baca cabang dan jam setiap kelas, lalu buka daftar murid pada kelas yang benar.",
      "keywords": [
        "jadwal",
        "hari",
        "senin",
        "kelas",
        "murid",
        "cabang",
        "shift",
        "jam"
      ],
      "prerequisites": [
        "Penugasan guru dan jadwal aktif sudah diatur admin."
      ],
      "groups": [
        {
          "id": "jadwal",
          "steps": [
            {
              "title": "Pilih Jadwal pada menu bawah",
              "paragraphs": [
                "Periksa ringkasan Seluruh Cabang Tugas. Geser deretan hari secara mendatar bila hari yang dicari belum terlihat, lalu pilih harinya."
              ]
            },
            {
              "title": "Baca setiap kartu kelas",
              "paragraphs": [
                "Cocokkan cabang, shift, jam mulai–selesai, nama program dan paket/varian. Periksa semua kelas pada hari itu, bukan hanya kartu pertama."
              ]
            },
            {
              "title": "Buka Daftar Murid",
              "paragraphs": [
                "Pilih Daftar Murid pada kelas yang dimaksud untuk melihat nama dan nomor induk. Gunakan identitas itu untuk membedakan murid bernama mirip."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.schedule
          ]
        }
      ],
      "expected": [
        "Hari, lokasi, jam, program, dan murid binaan diketahui sebelum mengajar."
      ],
      "systemRules": [
        "Jadwal ditampilkan lintas cabang tugas; guru tidak mengubah penempatan kelas/murid melalui halaman ini.",
        "Label Libur/tidak ada jadwal menjelaskan hari yang sedang dipilih.",
        "Daftar murid berasal dari penempatan kelas, bukan otomatis seluruh murid pada cabang atau program tersebut."
      ],
      "recommendations": [
        "Periksa jadwal terbaru saat ada perubahan tugas dan jangan menyimpulkan semua cabang memiliki jam yang sama."
      ],
      "troubleshooting": [
        {
          "question": "Kelas atau murid belum muncul.",
          "answer": "Periksa hari yang dipilih, identitas akun, dan cabang/jam yang diharapkan. Hubungi admin untuk jadwal aktif, penugasan guru, enrollment dan penempatan kelas; jangan menggunakan kartu milik kelas lain."
        },
        {
          "question": "Nama cabang terpotong pada kartu.",
          "answer": "Periksa informasi kelas dengan teliti dan gunakan jam/program sebagai pembanding. Jika masih ragu lokasi penugasannya, konfirmasikan ke admin sebelum presensi."
        }
      ]
    },
    {
      "slug": "jadwal-kartu",
      "title": "Membuka kartu mengajar dari jadwal",
      "summary": "Tombol pada kartu kelas menghubungkan jadwal dan tanggal sesi; selalu periksa tanggal sebelum mengisi.",
      "keywords": [
        "kartu dari jadwal",
        "isi kartu mengajar",
        "lihat kartu mengajar",
        "tanggal sesi",
        "submitted"
      ],
      "prerequisites": [
        "Kelas dan murid pada hari yang dipilih sudah benar."
      ],
      "groups": [
        {
          "id": "buka-kartu",
          "steps": [
            {
              "title": "Pilih hari dan kelas pada Jadwal",
              "paragraphs": [
                "Periksa cabang, program, paket/varian, jam dan Daftar Murid agar tidak membuka sesi kelas yang salah."
              ]
            },
            {
              "title": "Pilih Isi Kartu Mengajar atau Lihat Kartu Mengajar",
              "paragraphs": [
                "Isi Kartu Mengajar digunakan pada sesi yang belum dikirim. Lihat Kartu Mengajar menunjukkan kartu yang sudah submitted untuk tanggal sesi pada tautan tersebut."
              ]
            },
            {
              "title": "Periksa tanggal di dalam kartu",
              "paragraphs": [
                "Tautan dari jadwal menggunakan tanggal sesi sesuai hari jadwal yang tersedia. Jangan berasumsi tanggalnya selalu hari ini atau berarti semua pertemuan sebelumnya sudah lengkap.",
                "Bila kartu masih dapat diedit, gunakan tanggal sesi yang benar sesuai hari kelas dan tidak di masa depan. Gunakan Kembali ke Jadwal Mengajar untuk memilih kelas lain."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.schedule,
            GURU_SCREENSHOTS.cardSubmitted
          ]
        }
      ],
      "expected": [
        "Kartu yang terbuka sesuai kelas, murid, dan tanggal pertemuan yang akan dicatat/dilihat."
      ],
      "systemRules": [
        "Kartu submitted bersifat hanya-baca; mengganti URL bukan cara membuka kunci.",
        "Kartu mengajar dan presensi datang/pulang adalah pencatatan terpisah."
      ],
      "recommendations": [
        "Cocokkan tanggal pada header kartu dengan pertemuan sebenarnya sebelum menulis capaian atau mengirim."
      ],
      "troubleshooting": [
        {
          "question": "Yang terbuka adalah kartu lama.",
          "answer": "Periksa tanggal sesi pada kartu. Tautan hari jadwal dapat menunjuk pertemuan terakhir pada hari itu; pilih tanggal yang benar bila form masih dapat diedit, atau kembali ke Jadwal untuk memeriksa kelas."
        },
        {
          "question": "Kartu tidak ditemukan atau akses ditolak.",
          "answer": "Pastikan kelas berasal dari jadwal akun sendiri dan aksesnya masih berlaku. Laporkan kelas/tanggal kepada admin, bukan mengubah ID URL untuk membuka kelas rekan."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
