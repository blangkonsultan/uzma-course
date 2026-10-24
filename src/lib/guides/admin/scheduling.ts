import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_SCHEDULING = {
  "id": "scheduling",
  "title": "Draf dan papan jadwal",
  "articles": [
    {
      "slug": "jadwal-draf",
      "title": "Membuat dan membuka draf jadwal",
      "summary": "Gunakan draf untuk menyusun alokasi cabang secara terarah. Guru membaca jadwal yang berstatus aktif, bukan setiap draf yang dibuat.",
      "keywords": [
        "buat draf",
        "draft",
        "tanggal aktif",
        "cabang",
        "papan jadwal"
      ],
      "prerequisites": [
        "Cabang, shift aktif, program/varian, guru, dan data murid sudah disiapkan.",
        "Ketahui draf aktif cabang agar tidak menggantinya tanpa koordinasi."
      ],
      "groups": [
        {
          "id": "buat-draf",
          "steps": [
            {
              "title": "Pilih Buat Draf Baru",
              "paragraphs": [
                "Buka Draf Jadwal, pilih Buat Draf Baru, lalu tentukan Cabang dan Nama Draf Jadwal yang mudah dibedakan."
              ]
            },
            {
              "title": "Periksa tanggal dan status",
              "paragraphs": [
                "Isi Tanggal Aktif (Opsional) bila diperlukan. Pilih Status yang sesuai: Draf (Persiapan), Aktif (Sedang Berjalan), atau Arsip (Selesai/Lalu).",
                "Untuk menyusun rancangan yang belum boleh berjalan, gunakan Draf. Jangan menganggap tanggal saja sudah memastikan status operasionalnya benar."
              ]
            },
            {
              "title": "Simpan draf",
              "paragraphs": [
                "Pilih Buat Draf. Pada perubahan draf yang sudah ada, gunakan Simpan Perubahan setelah meninjau status dan dampaknya."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.draftForm
          ],
          "warning": "Memilih status Aktif dapat menggantikan draf aktif cabang. Periksa jadwal yang sedang dipakai sebelum menyimpan status tersebut."
        },
        {
          "id": "buka-papan",
          "steps": [
            {
              "title": "Buka papan untuk draf yang benar",
              "paragraphs": [
                "Pada daftar, cocokkan nama, cabang, tanggal, dan status. Pilih Buka Papan Jadwal atau tautan nama draf. Di papan, periksa identitas draf sebelum menambah alokasi."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.draftList
          ]
        }
      ],
      "expected": [
        "Draf tersedia pada daftar dengan cabang dan status yang benar.",
        "Papan Jadwal yang dibuka adalah milik draf/cabang yang dimaksud."
      ],
      "systemRules": [
        "Status draf dibedakan menjadi Draf, Aktif, dan Arsip.",
        "Pengaktifan draf berkaitan dengan aturan satu draf aktif per cabang; draf aktif sebelumnya dapat diarsipkan oleh sistem.",
        "Cabang draf menentukan sumber shift dan kandidat yang relevan."
      ],
      "recommendations": [
        "Gunakan nama yang menyebut tujuan/periode rancangan agar tidak tertukar.",
        "Periksa status yang benar-benar tersimpan, terutama bila tanggal aktif sudah terlewati."
      ],
      "troubleshooting": [
        {
          "question": "Draf tidak ditemukan pada daftar.",
          "answer": "Periksa pencarian, Cabang, dan Status yang aktif. Pastikan pembuatan draf sudah berhasil sebelum membuat ulang."
        },
        {
          "question": "Guru belum melihat alokasi yang baru disusun.",
          "answer": "Periksa draf yang aktif untuk cabang, penugasan guru, dan hari pada kelas. Draf persiapan tidak boleh diasumsikan sebagai jadwal yang sudah berjalan."
        }
      ]
    },
    {
      "slug": "jadwal-kelas",
      "title": "Menempatkan guru dan menentukan jam kelas",
      "summary": "Satu kelas memakai guru, varian program, hari, dan rentang waktu yang valid di dalam shift.",
      "keywords": [
        "tambah kelas",
        "wadah guru",
        "seret",
        "drag",
        "guru",
        "jam",
        "durasi",
        "bentrok"
      ],
      "prerequisites": [
        "Draf dan cabang yang benar sudah dibuka.",
        "Guru aktif memiliki cabang serta program yang sesuai, dan shift menyediakan waktu untuk durasi varian."
      ],
      "groups": [
        {
          "id": "hari-shift",
          "steps": [
            {
              "title": "Pilih hari sebelum membuat kelas",
              "paragraphs": [
                "Di Papan Jadwal, pilih Senin sampai Minggu sesuai alokasi yang akan dibuat. Cocokkan cabang, status draf, nama shift, dan batas jamnya.",
                "Gunakan pencarian serta Filter berdasarkan program belajar pada panel Wadah Guru untuk menemukan kandidat. Filter tidak membuat guru menjadi tersedia bila jadwalnya memang penuh."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.board
          ]
        },
        {
          "id": "pilih-guru",
          "steps": [
            {
              "title": "Buka Tambah Kelas pada shift tujuan",
              "paragraphs": [
                "Pilih Tambah Kelas pada kolom shift. Pada dialog, cari nama guru atau varian program, lalu pilih kombinasi yang benar.",
                "Kartu pada Wadah Guru juga mendukung alur seret ke shift; periksa kembali guru/varian dan pengaturan waktu setelahnya."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.classPicker
          ]
        },
        {
          "id": "atur-jam",
          "steps": [
            {
              "title": "Tentukan Jam Mulai",
              "paragraphs": [
                "Pada Atur Waktu Kelas, isi Jam Mulai. Jam Selesai (Otomatis) mengikuti durasi varian. Periksa bahwa seluruh sesi berada dalam batas shift, bukan hanya jam mulainya."
              ]
            },
            {
              "title": "Simpan Sesi lalu periksa kelas",
              "paragraphs": [
                "Pilih Simpan Sesi. Tunggu hasilnya dan pastikan kartu kelas muncul pada hari/shift yang benar dengan guru serta varian yang dimaksud. Batal atau Escape menutup dialog tanpa menyimpan kelas."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.classTime
          ]
        }
      ],
      "expected": [
        "Kartu kelas tampil pada hari dan shift yang dipilih dengan guru, varian, dan rentang waktu yang benar."
      ],
      "systemRules": [
        "Jam selesai harus lebih akhir dari jam mulai dan seluruh sesi harus berada di dalam shift.",
        "Pemeriksaan bentrok guru mencakup draf yang sedang disusun serta draf aktif lain, termasuk lintas cabang.",
        "Kandidat guru mempertimbangkan status aktif, penugasan, program, dan waktu yang sudah terpakai."
      ],
      "recommendations": [
        "Periksa semua jadwal terkait sebelum mengubah alokasi guru lintas cabang.",
        "Gunakan tombol Tambah Kelas sebagai alur terarah bila seret-lepas sulit dilakukan pada perangkat."
      ],
      "troubleshooting": [
        {
          "question": "Guru atau varian tidak muncul sebagai kandidat.",
          "answer": "Periksa hari, cabang penugasan, status aktif, program guru, filter program, serta sisa waktu yang tersedia dalam shift."
        },
        {
          "question": "Waktu di luar batas atau bentrok.",
          "answer": "Pilih rentang yang cukup untuk durasi varian dan tidak beririsan dengan sesi guru lain pada cakupan yang diperiksa. Jangan mengarsipkan jadwal aktif hanya untuk memaksa alokasi yang belum ditinjau."
        },
        {
          "question": "Penyimpanan menampilkan kesalahan validasi.",
          "answer": "Baca pesan dan periksa apakah kelas benar-benar muncul sebelum mengulang. Jika pemeriksaan jadwal gagal tanpa penjelasan operasional, laporkan draf, cabang, hari, jam, serta pesan kepada pengelola aplikasi; jangan menambah data langsung di database."
        }
      ]
    },
    {
      "slug": "jadwal-murid",
      "title": "Menempatkan atau mengeluarkan murid dari kelas",
      "summary": "Tempatkan murid pada kelas yang sesuai varian dan masih memiliki kapasitas serta jatah pertemuan.",
      "keywords": [
        "tambah murid",
        "penempatan",
        "slot",
        "kapasitas",
        "frekuensi",
        "kelas penuh",
        "keluarkan murid"
      ],
      "prerequisites": [
        "Kelas sudah tersedia pada hari dan shift yang benar.",
        "Murid aktif memiliki enrollment aktif untuk varian yang sesuai."
      ],
      "groups": [
        {
          "id": "tempatkan",
          "steps": [
            {
              "title": "Periksa kelas dan kapasitasnya",
              "paragraphs": [
                "Cocokkan guru, varian, hari, dan jam. Jika Tambah Murid tidak tersedia, periksa apakah kapasitas kelas sudah penuh."
              ]
            },
            {
              "title": "Pilih Tambah Murid",
              "paragraphs": [
                "Buka dialog Tambah Murid, cari nama murid yang benar, lalu gunakan pilihan pada barisnya. Tunggu hasil penempatan dan periksa nama murid pada kelas.",
                "Kartu murid pada panel juga dapat digunakan dalam alur seret-lepas ke kelas yang sesuai. Tetap periksa hasil penyimpanan; kartu terseret bukan bukti bahwa penempatan diterima sistem."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.studentPicker
          ]
        },
        {
          "id": "tinjau-alokasi",
          "steps": [
            {
              "title": "Periksa alokasi atau keluarkan bila memang perlu",
              "paragraphs": [
                "Tinjau murid yang sudah terpasang dan jatah pertemuannya. Untuk mengeluarkan, pilih ikon Keluarkan murid pada murid yang tepat dan baca konfirmasi sebelum menerapkan.",
                "Mengeluarkan penempatan berbeda dengan menghapus profil atau enrollment. Jangan melakukannya hanya untuk menghilangkan pesan penuh atau batas frekuensi."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.board
          ],
          "warning": "Tindakan keluarkan/hapus mengubah alokasi. Pastikan nama murid dan kelas benar serta perubahan telah dikoordinasikan."
        }
      ],
      "expected": [
        "Murid yang dipilih terlihat pada kelas yang sesuai, atau penempatannya dihapus sesuai konfirmasi.",
        "Profil dan enrollment tetap ditangani melalui Data Murid, bukan melalui tindakan penempatan kelas."
      ],
      "systemRules": [
        "Penempatan memerlukan kecocokan varian dan enrollment aktif.",
        "Kapasitas kelas mengikuti Sistem (Maks Murid) varian.",
        "Frekuensi mingguan dan alokasi yang sudah ada ikut membatasi penempatan; dialog tidak mengubah ketentuan paket murid."
      ],
      "recommendations": [
        "Periksa hari dan program pada setiap penempatan; jangan menyamakan semua varian dalam program yang sama.",
        "Gunakan pencarian/filter untuk menemukan kandidat, bukan membuat profil murid duplikat."
      ],
      "troubleshooting": [
        {
          "question": "Murid tidak ada dalam pilihan.",
          "answer": "Periksa cabang, status aktif profil, Status Program, varian enrollment, penempatan yang sudah ada, dan kuota pertemuan mingguan. Bersihkan filter yang tidak relevan."
        },
        {
          "question": "Kelas penuh atau frekuensi sudah terpenuhi.",
          "answer": "Periksa alokasi pada draf yang sama dan ketentuan varian. Perbaiki penempatan yang keliru secara terencana; jangan menaikkan kapasitas atau frekuensi tanpa keputusan operasional yang sah."
        }
      ]
    },
    {
      "slug": "jadwal-status-cetak",
      "title": "Meninjau status dan mencetak jadwal",
      "summary": "Pastikan rancangan yang tepat dipakai operasional, lalu pilih keluaran cetak untuk guru atau murid.",
      "keywords": [
        "aktifkan draf",
        "arsip",
        "cetak guru",
        "cetak murid",
        "print",
        "hapus kelas"
      ],
      "prerequisites": [
        "Alokasi guru, murid, hari, dan jam sudah diperiksa.",
        "Ketahui jadwal aktif cabang dan tujuan perubahan status."
      ],
      "groups": [
        {
          "id": "status-draf",
          "steps": [
            {
              "title": "Tinjau alokasi sebelum mengaktifkan",
              "paragraphs": [
                "Buka papan dan periksa seluruh hari yang dipakai. Pastikan tidak ada konflik yang belum diselesaikan serta data cabang, shift, program, guru, dan murid sesuai."
              ]
            },
            {
              "title": "Kelola status dari draf yang benar",
              "paragraphs": [
                "Kembali ke Draf Jadwal, buka Edit atau tindakan pengaktifan yang tersedia. Periksa tanggal dan status, lalu simpan/konfirmasi sesuai pesan sistem.",
                "Status Draf, Aktif, dan Arsip memiliki arti berbeda. Pengaktifan draf dapat mengarsipkan draf aktif lain pada cabang yang sama."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.draftList
          ],
          "warning": "Mengaktifkan atau mengarsipkan memengaruhi jadwal yang dipakai operasional. Jangan mengubah status hanya untuk mencetak atau menghindari pemeriksaan bentrok."
        },
        {
          "id": "cetak",
          "steps": [
            {
              "title": "Pilih keluaran yang diperlukan",
              "paragraphs": [
                "Pada daftar atau papan, pilih Cetak Guru untuk sudut pandang guru, atau Cetak Murid untuk sudut pandang murid. Periksa nama draf/cabang pada pratinjau."
              ]
            },
            {
              "title": "Periksa pratinjau sebelum cetak",
              "paragraphs": [
                "Tinjau hari, waktu, nama, dan pengaturan kertas pada browser. Sesuaikan opsi header/footer serta grafik latar bila diperlukan, lalu cetak atau simpan sebagai PDF melalui browser."
              ]
            },
            {
              "title": "Bedakan cetak, arsip, dan hapus",
              "paragraphs": [
                "Mencetak tidak mengubah status draf. Hapus kelas adalah tindakan berbeda yang mengubah alokasi; gunakan hanya setelah memeriksa kelas, murid, dan referensi yang terkait serta membaca konfirmasi."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.schedulePrint
          ]
        }
      ],
      "expected": [
        "Status draf sesuai keputusan operasional dan keluaran cetak memuat jadwal/cabang yang benar."
      ],
      "systemRules": [
        "Guru membaca alokasi dari jadwal yang berstatus aktif sesuai penugasan.",
        "Cetak Guru dan Cetak Murid merupakan dua keluaran berbeda.",
        "Penghapusan kelas bukan cara mengedit riwayat kartu mengajar atau transaksi; pembatasan referensi tetap mengikuti sistem."
      ],
      "recommendations": [
        "Periksa pratinjau dan koordinasikan pergantian jadwal sebelum membagikan hasil cetak.",
        "Pertahankan riwayat yang diperlukan; gunakan status yang sesuai, bukan penghapusan untuk merapikan tampilan."
      ],
      "troubleshooting": [
        {
          "question": "Jadwal cetak berbeda dari yang diharapkan.",
          "answer": "Periksa draf, cabang, jenis cetak, dan alokasi tersimpan. Kembali ke papan yang tepat; jangan menebak dari nama file cetak saja."
        },
        {
          "question": "Guru melihat jadwal lama.",
          "answer": "Periksa draf yang benar-benar aktif dan penugasan cabang/programnya. Pastikan pergantian status telah tersimpan dan halaman guru dimuat ulang."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
