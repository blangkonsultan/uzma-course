import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_STUDENTS = {
  "id": "students",
  "title": "Murid dan enrollment",
  "articles": [
    {
      "slug": "murid-daftar",
      "title": "Mendaftarkan murid dan wali",
      "summary": "Daftarkan identitas murid, kontak wali, cabang, dan program yang benar agar penjadwalan serta penagihan dapat memakai data yang sesuai.",
      "keywords": [
        "murid baru",
        "siswa",
        "wali",
        "orang tua",
        "pendaftaran",
        "nomor induk",
        "NIS"
      ],
      "prerequisites": [
        "Data murid dan wali diperoleh melalui prosedur pendaftaran yang sah.",
        "Cabang, program, dan varian yang dipilih sudah tersedia."
      ],
      "groups": [
        {
          "id": "identitas",
          "steps": [
            {
              "title": "Buka form tambah murid",
              "paragraphs": [
                "Pilih Data Murid lalu tambah murid. Isi Nama Lengkap Murid dan lengkapi Tanggal Lahir serta Alamat Tempat Tinggal sesuai kebutuhan."
              ]
            },
            {
              "title": "Isi kontak wali",
              "paragraphs": [
                "Lengkapi Nama Orang Tua / Wali dan Nomor WhatsApp Orang Tua. Isi Email Orang Tua bila digunakan. Periksa kembali penerima sebelum memakai nomor tersebut untuk komunikasi."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.studentForm
          ]
        },
        {
          "id": "daftar-program",
          "steps": [
            {
              "title": "Pilih cabang dan program",
              "paragraphs": [
                "Tentukan Cabang Belajar, lalu centang program yang diikuti. Periksa detail setiap program yang terbuka: varian, status program, awal siklus, nominal SPP, dan diskon yang relevan."
              ]
            },
            {
              "title": "Simpan dan cek detail",
              "paragraphs": [
                "Isi Catatan Khusus hanya bila diperlukan, lalu pilih Simpan Data. Buka detail murid untuk memeriksa identitas, nomor induk yang diterbitkan sistem, wali, serta enrollment-nya."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.studentDetail
          ]
        }
      ],
      "expected": [
        "Murid tercatat pada Data Murid dan detailnya memuat kontak wali serta program yang benar.",
        "Nomor induk dari sistem dapat dibaca setelah penyimpanan berhasil."
      ],
      "systemRules": [
        "Isian wajib pada data murid/wali harus dipenuhi.",
        "Penempatan kelas memakai cabang dan enrollment yang sesuai; membuat profil saja bukan penempatan otomatis ke kelas."
      ],
      "recommendations": [
        "Jangan membuat nomor induk sendiri atau menyalin nomor dari screenshot demo.",
        "Catat informasi pribadi secukupnya untuk operasional dan batasi pembagiannya; jangan memasukkan data wali ke CMS publik."
      ],
      "troubleshooting": [
        {
          "question": "Program atau varian tidak tersedia.",
          "answer": "Periksa data master, status program/varian, dan cabang yang dipilih. Minta pengelola master memeriksa ketersediaannya sebelum melanjutkan."
        },
        {
          "question": "Data murid belum muncul setelah simpan.",
          "answer": "Baca pesan hasil simpan, lalu periksa pencarian serta filter cabang/status. Jangan langsung mendaftarkan ulang tanpa memeriksa kemungkinan data sudah tersimpan."
        }
      ]
    },
    {
      "slug": "murid-enrollment",
      "title": "Mengelola program, siklus, dan diskon murid",
      "summary": "Satu murid dapat memiliki beberapa enrollment. Periksa rincian setiap program, bukan hanya satu nominal pada profil.",
      "keywords": [
        "enrollment",
        "varian murid",
        "multi program",
        "siklus",
        "diskon",
        "persentase",
        "nominal spp",
        "cuti"
      ],
      "prerequisites": [
        "Profil murid dan pilihan programnya sudah benar.",
        "Ketahui ketentuan SPP, tanggal awal siklus, serta diskon yang disetujui."
      ],
      "groups": [
        {
          "id": "pilih-enrollment",
          "steps": [
            {
              "title": "Buka Edit murid yang sesuai",
              "paragraphs": [
                "Cari murid di Data Murid, periksa detailnya, lalu buka Edit. Cocokkan Cabang Belajar dan seluruh program yang dicentang sebelum mengubah isian."
              ]
            },
            {
              "title": "Periksa setiap program yang diikuti",
              "paragraphs": [
                "Pada Detail Tagihan SPP & Siklus, pilih Varian Program dan Status Program untuk masing-masing enrollment. Pilih kondisi sebenarnya: Sedang Aktif, Cuti Sementara, Lulus, atau Keluar / Berhenti."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.studentEnrollment
          ]
        },
        {
          "id": "biaya-siklus",
          "steps": [
            {
              "title": "Isi siklus dan nominal per program",
              "paragraphs": [
                "Periksa Tanggal Mulai Siklus serta Nominal SPP (Rp) pada setiap program. Angka tersebut tidak harus sama antarprogram atau antarmurid. Siklus SPP berjalan 28 hari, bukan otomatis tanggal yang sama setiap bulan kalender."
              ]
            },
            {
              "title": "Pilih satuan diskon dengan benar",
              "paragraphs": [
                "Tipe Diskon Tepat Waktu dapat berupa Tidak Ada, Nominal (Rp), atau Persentase (%). Isi Nilai Diskon sesuai satuan yang dipilih dan validasi form; jangan mengisi nominal rupiah pada kolom persentase."
              ]
            },
            {
              "title": "Simpan lalu periksa enrollment dan tagihan",
              "paragraphs": [
                "Pilih Simpan Data. Periksa detail murid dan, bila berkaitan dengan penagihan, tagihan pada modul SPP. Jangan menganggap edit enrollment sama dengan mengubah invoice atau kwitansi yang sudah tercatat."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.studentDetail
          ],
          "warning": "Melepas centang program atau mengganti status mengubah enrollment. Jangan melakukannya hanya untuk menyembunyikan bagian form atau mengatasi tagihan tanpa pemeriksaan."
        }
      ],
      "expected": [
        "Setiap enrollment memuat varian, status, tanggal siklus, nominal, serta diskon yang sesuai."
      ],
      "systemRules": [
        "Status enrollment berbeda dari status aktif profil murid.",
        "Penjadwalan mempertimbangkan enrollment aktif dan kecocokan varian; nama program saja tidak cukup bila variannya berbeda.",
        "Tagihan dan pembayaran memiliki catatan tersendiri; edit master/enrollment bukan tindakan membatalkan transaksi yang telah tercatat."
      ],
      "recommendations": [
        "Periksa semua program pada murid multi-program agar tidak hanya memperbarui baris pertama.",
        "Koordinasikan perubahan siklus atau biaya sebelum menerbitkan tagihan berikutnya."
      ],
      "troubleshooting": [
        {
          "question": "Murid tidak dapat dipilih untuk varian kelas.",
          "answer": "Cocokkan cabang, status aktif profil, Status Program, dan Varian Program. Periksa pula frekuensi mingguan serta alokasi yang sudah ada."
        },
        {
          "question": "SPP atau diskon tampak berbeda antarprogram.",
          "answer": "Buka rincian tiap enrollment dan invoice terkait. Periksa satuan diskon, tanggal siklus, dan nominal yang memang tersimpan, bukan hanya Default SPP pada program."
        }
      ]
    },
    {
      "slug": "murid-status",
      "title": "Membedakan status murid dan status program",
      "summary": "Gunakan status pada tingkat yang benar: profil keseluruhan atau keikutsertaan pada satu program.",
      "keywords": [
        "aktif murid",
        "nonaktif",
        "status program",
        "cuti sementara",
        "lulus",
        "keluar",
        "berhenti"
      ],
      "prerequisites": [
        "Pastikan kondisi murid dan program yang terpengaruh telah disepakati pengelola."
      ],
      "groups": [
        {
          "id": "status-murid",
          "steps": [
            {
              "title": "Tentukan tingkat perubahan",
              "paragraphs": [
                "Jika hanya satu program yang berubah, periksa Status Program pada enrollment tersebut. Jika status profil keseluruhan berubah, gunakan Status Murid pada Edit atau tindakan status di daftar/detail."
              ]
            },
            {
              "title": "Baca dan terapkan konfirmasi yang sesuai",
              "paragraphs": [
                "Untuk tindakan daya pada profil, baca nama dan dampak pada dialog. Untuk edit enrollment, periksa setiap program sebelum memilih Simpan Data. Batalkan bila tingkat perubahan belum jelas."
              ]
            },
            {
              "title": "Periksa hasil pada data terkait",
              "paragraphs": [
                "Pastikan detail murid memperlihatkan status profil dan enrollment yang benar. Periksa penempatan jadwal serta penagihan yang masih perlu ditangani; jangan menghapus riwayat untuk menghilangkan baris dari daftar."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.studentList,
            ADMIN_SCREENSHOTS.studentEnrollment
          ],
          "warning": "Cuti pada satu program tidak sama dengan menonaktifkan seluruh profil. Pilih tindakan yang benar agar program lain tidak ditangani secara keliru."
        }
      ],
      "expected": [
        "Status profil dan masing-masing program mencerminkan kondisi sebenarnya."
      ],
      "systemRules": [
        "Status program tersedia sebagai Sedang Aktif, Cuti Sementara, Lulus, dan Keluar / Berhenti.",
        "Status aktif profil dan enrollment adalah dua pengaturan yang berbeda.",
        "Perubahan status bukan penghapusan murid atau pembatalan otomatis riwayat pembayaran."
      ],
      "recommendations": [
        "Periksa kewajiban/tagihan dan alokasi kelas sebelum mengubah status operasional."
      ],
      "troubleshooting": [
        {
          "question": "Murid hilang dari daftar kandidat kelas.",
          "answer": "Periksa status profil dan enrollment, cabang, varian, filter program, serta frekuensi yang sudah teralokasi."
        },
        {
          "question": "Riwayat atau tagihan lama masih terlihat.",
          "answer": "Riwayat memiliki data dan statusnya sendiri. Tinjau modul terkait; jangan mencatat pembayaran, menghapus data, atau mengubah status lain hanya untuk menyembunyikan riwayat."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
