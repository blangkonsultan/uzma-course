import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_BRANCHES = {
  "id": "branches",
  "title": "Cabang dan lokasi",
  "articles": [
    {
      "slug": "cabang-tambah",
      "title": "Menambahkan cabang baru",
      "summary": "Daftarkan identitas dan lokasi cabang sebelum menempatkan guru, murid, atau shift di sana.",
      "keywords": [
        "master cabang",
        "cabang baru",
        "desa",
        "kecamatan",
        "alamat"
      ],
      "prerequisites": [
        "Identitas cabang dan wilayahnya sudah disetujui pengelola.",
        "Siapkan ID unik, nama, kecamatan, desa/kelurahan, serta informasi lokasi yang benar."
      ],
      "groups": [
        {
          "id": "identitas",
          "steps": [
            {
              "title": "Buka form tambah cabang",
              "paragraphs": [
                "Pilih Data Cabang, lalu tombol tambah pada daftar. Isi ID Unik Cabang dan Nama Cabang. Gunakan ID yang belum dipakai; contoh pada placeholder bukan ID yang wajib dipilih."
              ]
            },
            {
              "title": "Lengkapi wilayah dan alamat",
              "paragraphs": [
                "Isi Kecamatan dan Desa / Kelurahan. Lengkapi Sub-Nama / Unit Sentra serta Alamat Lengkap bila diperlukan agar cabang mudah dibedakan."
              ]
            },
            {
              "title": "Periksa peta dan presensi",
              "paragraphs": [
                "Bedakan URL Embed Google Maps dengan Link Navigasi Google Maps. Periksa Latitude, Longitude, dan Radius Geofence (Meter); radius digunakan pada presensi guru, bukan jarak tampilan peta."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.branchForm
          ]
        },
        {
          "id": "simpan",
          "steps": [
            {
              "title": "Simpan lalu periksa daftar",
              "paragraphs": [
                "Pilih Simpan Cabang setelah semua isian benar. Buka detail cabang yang baru muncul untuk memeriksa identitas dan lokasi tersimpan sebelum dipakai dalam data operasional."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.branchList
          ]
        }
      ],
      "expected": [
        "Cabang tampil pada Data Cabang dan detailnya memuat informasi yang baru disimpan."
      ],
      "systemRules": [
        "Isian bertanda wajib harus dilengkapi. ID cabang tidak dapat diubah lewat form edit setelah cabang tersimpan.",
        "Cabang non-aktif tidak tersedia untuk pilihan pendaftaran/penempatan baru yang mensyaratkan cabang aktif."
      ],
      "recommendations": [
        "Gunakan penamaan cabang yang konsisten; jangan membuat cabang duplikat hanya karena pencarian sedang terfilter.",
        "Uji tautan peta dan periksa titik koordinat sebelum guru mulai melakukan presensi."
      ],
      "troubleshooting": [
        {
          "question": "ID cabang sudah digunakan.",
          "answer": "Periksa apakah cabang itu sebenarnya sudah ada. Jika memang cabang berbeda, gunakan ID unik lain; jangan mengubah data cabang lama hanya untuk mengatasi ID ganda."
        },
        {
          "question": "Guru tidak dapat presensi di cabang baru.",
          "answer": "Periksa status cabang, koordinat, radius, penugasan guru, dan jadwal aktifnya. Pendaftaran cabang saja belum membuat penugasan atau jadwal guru."
        }
      ]
    },
    {
      "slug": "cabang-lokasi",
      "title": "Mengubah lokasi dan radius presensi",
      "summary": "Pastikan titik cabang benar agar validasi GPS tidak menolak guru yang berada di lokasi yang sesuai.",
      "keywords": [
        "edit cabang",
        "GPS",
        "geofence",
        "radius",
        "latitude",
        "longitude",
        "maps"
      ],
      "prerequisites": [
        "Ketahui cabang yang akan diperbarui.",
        "Siapkan tautan Google Maps resmi untuk lokasi cabang tersebut."
      ],
      "groups": [
        {
          "id": "lokasi",
          "steps": [
            {
              "title": "Buka Detail lalu Edit cabang",
              "paragraphs": [
                "Cari cabang pada Data Cabang. Periksa nama dan wilayah pada detail, lalu buka Edit agar tidak memperbarui cabang yang salah."
              ]
            },
            {
              "title": "Isi tautan peta yang sesuai",
              "paragraphs": [
                "URL Embed Google Maps dipakai untuk tampilan peta. Link Navigasi Google Maps dipakai untuk membuka navigasi dan mengambil titik koordinat. Kedua kolom tidak boleh dianggap selalu berisi URL yang sama."
              ]
            },
            {
              "title": "Tarik atau periksa titik koordinat",
              "paragraphs": [
                "Setelah Link Navigasi Google Maps diisi, pilih Tarik Titik Koordinat. Periksa kembali Latitude dan Longitude hasilnya; koreksi secara manual hanya bila Anda memiliki titik yang benar.",
                "Isi Radius Geofence (Meter) dalam meter sesuai kebijakan cabang. Jangan menyalin nilai demo sebagai aturan semua cabang."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.branchForm
          ]
        },
        {
          "id": "verifikasi",
          "steps": [
            {
              "title": "Perbarui dan cek hasil",
              "paragraphs": [
                "Pilih Perbarui Cabang. Buka detail cabang lagi, periksa tautan navigasi, dan koordinasikan perubahan radius/lokasi dengan guru yang bertugas."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.branchDetail
          ]
        }
      ],
      "expected": [
        "Detail cabang memuat lokasi serta radius yang sudah diperiksa."
      ],
      "systemRules": [
        "Presensi membandingkan posisi perangkat dengan koordinat dan radius cabang yang dikonfigurasi.",
        "Pengambilan koordinat melalui tautan mengikuti validasi URL Google Maps pada sistem; tautan yang ditolak tidak boleh diganti dengan URL sembarang untuk melewati validasi."
      ],
      "recommendations": [
        "Gunakan radius yang mencerminkan area operasional sebenarnya, bukan diperbesar untuk menutupi koordinat yang salah.",
        "Periksa posisi di peta sebelum menguji presensi di HP."
      ],
      "troubleshooting": [
        {
          "question": "Tarik Titik Koordinat gagal.",
          "answer": "Periksa bahwa Link Navigasi Google Maps valid, menggunakan HTTPS, dan menunjuk ke lokasi yang benar. Coba tautan lokasi resmi yang lebih lengkap bila tautan pendek tidak berhasil; baca pesan sistem."
        },
        {
          "question": "Guru berada di cabang tetapi di luar radius.",
          "answer": "Periksa izin dan akurasi GPS di HP, lalu cocokkan koordinat cabang. Jangan langsung memperbesar radius sebelum memastikan titik cabang benar."
        }
      ]
    },
    {
      "slug": "cabang-status",
      "title": "Mengaktifkan atau menonaktifkan cabang",
      "summary": "Ubah status operasional dengan sadar; status non-aktif memengaruhi pilihan penempatan baru.",
      "keywords": [
        "aktif",
        "nonaktif",
        "status cabang",
        "power"
      ],
      "prerequisites": [
        "Periksa cabang serta dampak perubahan pada kegiatan operasional."
      ],
      "groups": [
        {
          "id": "ubah-status",
          "steps": [
            {
              "title": "Temukan cabang dan tindakan statusnya",
              "paragraphs": [
                "Buka Data Cabang atau detail cabang. Periksa badge status. Tombol daya menawarkan Nonaktifkan untuk cabang aktif, atau Aktifkan untuk cabang non-aktif."
              ]
            },
            {
              "title": "Baca konfirmasi sebelum melanjutkan",
              "paragraphs": [
                "Pilih tombol status untuk membuka dialog. Baca nama cabang dan dampaknya. Pilih Ya, Nonaktifkan atau Ya, Aktifkan hanya bila memang akan mengubah status; Batal menutup dialog tanpa menerapkan perubahan."
              ]
            },
            {
              "title": "Periksa badge setelah tindakan",
              "paragraphs": [
                "Tunggu hasil penyimpanan, lalu pastikan badge dan ketersediaan cabang sesuai tujuan. Sesuaikan filter Status jika cabang tidak terlihat pada daftar."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.branchStatus
          ],
          "warning": "Jangan menonaktifkan cabang yang masih dipakai operasional tanpa koordinasi. Tombol konfirmasi menerapkan perubahan, bukan sekadar pratinjau."
        }
      ],
      "expected": [
        "Status cabang berubah sesuai konfirmasi atau tetap semula bila dibatalkan."
      ],
      "systemRules": [
        "Cabang non-aktif tidak muncul pada pilihan pendaftaran murid baru atau penempatan guru yang memerlukan cabang aktif.",
        "Perubahan status bukan penghapusan cabang atau riwayatnya."
      ],
      "recommendations": [
        "Selesaikan koordinasi jadwal dan penempatan sebelum menonaktifkan cabang."
      ],
      "troubleshooting": [
        {
          "question": "Cabang hilang dari pilihan form baru.",
          "answer": "Periksa status aktifnya di Data Cabang. Bila harus dipakai kembali, aktifkan melalui dialog yang benar; jangan membuat cabang duplikat."
        },
        {
          "question": "Perubahan status gagal.",
          "answer": "Baca pesan yang muncul dan periksa koneksi. Muat ulang daftar untuk mengetahui status tersimpan sebelum mengulang tindakan."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
