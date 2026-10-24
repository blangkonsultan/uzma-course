import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_TEACHERS = {
  "id": "teachers",
  "title": "Guru, penempatan, dan kompensasi",
  "articles": [
    {
      "slug": "guru-akun",
      "title": "Membuat akun dan profil guru",
      "summary": "Pembuatan guru mencakup akun login, identitas, penempatan cabang, dan program yang dapat diajar.",
      "keywords": [
        "guru baru",
        "akun guru",
        "email",
        "kata sandi",
        "homebase",
        "pengajar"
      ],
      "prerequisites": [
        "Guru memang akan mendapat akses portal dan datanya sudah diperiksa.",
        "Siapkan email login yang belum dipakai serta cabang/program penugasannya."
      ],
      "groups": [
        {
          "id": "akun",
          "steps": [
            {
              "title": "Buka tambah guru",
              "paragraphs": [
                "Pilih Data Guru dan form tambah. Isi Nama Lengkap Guru, Email Login, dan Kata Sandi Awal. Lengkapi Tanggal Lahir serta Nomor WhatsApp / HP bila diperlukan.",
                "Email login dipakai untuk masuk ke portal, bukan sekadar kontak. Jangan menggunakan email milik guru lain."
              ]
            },
            {
              "title": "Pilih cabang penugasan dan homebase",
              "paragraphs": [
                "Centang Cabang Penugasan yang sesuai. Pilih Cabang Utama (Homebase) dari cabang yang sudah dicentang; penugasan tambahan tidak harus sama dengan cabang utama."
              ]
            },
            {
              "title": "Tetapkan program mengajar",
              "paragraphs": [
                "Pilih program yang benar pada kelompok program berlisensi/original yang tersedia. Penempatan cabang saja tidak menggantikan penugasan program."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.teacherForm
          ]
        },
        {
          "id": "cek-akun",
          "steps": [
            {
              "title": "Periksa kompensasi lalu simpan",
              "paragraphs": [
                "Lengkapi bagian Kompensasi & Bank yang memang berlaku, lalu pilih Simpan Guru. Periksa daftar dan detail guru untuk memastikan akun/profil serta penugasannya tersimpan."
              ]
            },
            {
              "title": "Serahkan akses secara pribadi",
              "paragraphs": [
                "Sampaikan akun hanya kepada guru yang bersangkutan dan arahkan untuk mengganti kata sandi melalui Profil. Jangan mencantumkan kata sandi pada screenshot, grup umum, atau panduan."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.teacherList
          ]
        }
      ],
      "expected": [
        "Guru tampil pada Data Guru dengan identitas, cabang, program, dan status yang benar.",
        "Guru dapat memakai akun miliknya pada portal guru sesuai akses yang diberikan."
      ],
      "systemRules": [
        "Email login harus dapat digunakan untuk pembuatan akun dan tidak boleh bertabrakan dengan akun yang sudah ada.",
        "Pemilihan guru pada papan jadwal mempertimbangkan status aktif, penempatan cabang, program, dan ketersediaan jadwal."
      ],
      "recommendations": [
        "Gunakan kata sandi awal yang memenuhi petunjuk form dan serahkan lewat saluran pribadi.",
        "Minta guru memeriksa profil dan jadwalnya sebelum mulai mengajar."
      ],
      "troubleshooting": [
        {
          "question": "Email dinyatakan sudah digunakan.",
          "answer": "Periksa apakah akun guru itu sudah dibuat sebelumnya. Jangan membuat profil duplikat atau menggunakan email orang lain; minta pengelola akun memeriksa akun yang ada."
        },
        {
          "question": "Guru baru belum muncul sebagai kandidat kelas.",
          "answer": "Periksa cabang penugasan, program mengajar, status aktif, hari, filter program, serta jam yang sudah dialokasikan. Akun berhasil dibuat belum berarti otomatis memiliki kelas."
        }
      ]
    },
    {
      "slug": "guru-penempatan-honor",
      "title": "Mengubah penempatan, bank, dan kompensasi guru",
      "summary": "Perbarui profil yang sama dan periksa seluruh penugasan sebelum menyimpan, terutama untuk guru lintas cabang.",
      "keywords": [
        "edit guru",
        "cabang tambahan",
        "bank",
        "rekening",
        "tunjangan",
        "honor minimum",
        "garansi",
        "program"
      ],
      "prerequisites": [
        "Perubahan penempatan atau kompensasi sudah disetujui pengelola.",
        "Siapkan informasi rekening dan nominal yang benar; jangan menyalin nilai demo."
      ],
      "groups": [
        {
          "id": "penempatan",
          "steps": [
            {
              "title": "Buka detail dan Edit guru",
              "paragraphs": [
                "Cari guru di Data Guru, periksa identitasnya, lalu buka Edit. Gunakan filter cabang untuk menemukan guru; penugasan tambahan juga perlu diperiksa."
              ]
            },
            {
              "title": "Tinjau semua cabang dan program",
              "paragraphs": [
                "Periksa Cabang Penugasan dan Cabang Utama (Homebase). Pertahankan penugasan yang masih berlaku sebelum menambah atau melepas centang cabang/program lain."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.teacherDetail
          ]
        },
        {
          "id": "kompensasi",
          "steps": [
            {
              "title": "Isi rekening penerima yang benar",
              "paragraphs": [
                "Pada Kompensasi & Bank, periksa Nama Bank, Nomor Rekening, dan Nama Pemilik Rekening. Data ini harus sesuai penerima yang sebenarnya, bukan hanya nama panggilan guru."
              ]
            },
            {
              "title": "Atur tunjangan dan honor minimum",
              "paragraphs": [
                "Gunakan Tambah Tunjangan bila ada komponen tetap, lalu isi Nama Tunjangan dan Nominal (Rp) pada setiap baris. Hapus hanya komponen yang memang tidak berlaku.",
                "Jika pengaturan honor minimum digunakan, aktifkan pengaturannya dan isi nominal sesuai kesepakatan. Biarkan tidak aktif bila jaminan tersebut tidak digunakan."
              ]
            },
            {
              "title": "Simpan lalu cek periode penggajian",
              "paragraphs": [
                "Gunakan tombol simpan pada form, lalu periksa detail guru. Buka Penggajian Guru untuk memeriksa komponen dan hasil pada periode yang dimaksud; jangan menganggap data profil sama dengan bukti honor sudah dibayar."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.teacherCompensation
          ],
          "warning": "Perubahan rekening dan nominal adalah data operasional penting. Periksa kembali penerima, satuan rupiah, dan periode yang akan diproses sebelum menyimpan."
        }
      ],
      "expected": [
        "Profil guru memuat penugasan serta komponen kompensasi yang benar.",
        "Hasil periode penggajian diperiksa terpisah melalui Penggajian Guru."
      ],
      "systemRules": [
        "Cabang Utama dipilih dari cabang penugasan yang tersedia.",
        "Honor per sesi terkait varian program; pengaturan tunjangan dan minimum pada profil merupakan komponen yang berbeda.",
        "Periode payroll memiliki status dan snapshot-nya sendiri; memperbarui profil tidak sama dengan mengubah atau membayar periode yang sudah ditutup."
      ],
      "recommendations": [
        "Koordinasikan perubahan penempatan dengan jadwal aktif pada seluruh cabang.",
        "Periksa digit rekening dan nominal sebelum setiap proses pembayaran."
      ],
      "troubleshooting": [
        {
          "question": "Homebase yang dibutuhkan tidak tersedia.",
          "answer": "Periksa apakah cabang tersebut aktif dan sudah dicentang dalam Cabang Penugasan. Jangan mengganti cabang lain hanya untuk menutup pesan form."
        },
        {
          "question": "Angka honor tidak sama dengan yang diharapkan.",
          "answer": "Periksa periode payroll, sesi yang masuk, status periode, komponen tunjangan, honor minimum, serta penyesuaian. Simpan informasi periode/guru saat meminta pemeriksaan."
        }
      ]
    },
    {
      "slug": "guru-status",
      "title": "Mengubah status operasional guru",
      "summary": "Status aktif menentukan ketersediaan guru untuk penugasan baru; pengelolaan akses akun adalah hal yang harus diperiksa tersendiri.",
      "keywords": [
        "guru aktif",
        "guru nonaktif",
        "status pengajar",
        "akun nonaktif"
      ],
      "prerequisites": [
        "Pastikan guru dan dampak perubahan pada jadwal aktif telah ditinjau."
      ],
      "groups": [
        {
          "id": "status-guru",
          "steps": [
            {
              "title": "Periksa guru yang benar",
              "paragraphs": [
                "Buka Data Guru atau detailnya. Cocokkan nama dan penempatan cabang, lalu periksa badge aktif/non-aktif."
              ]
            },
            {
              "title": "Gunakan tombol daya dan konfirmasi",
              "paragraphs": [
                "Pilih tindakan status yang sesuai. Baca nama serta pesan dialog, lalu konfirmasi hanya bila memang akan diterapkan. Gunakan Batal jika masih ada hal yang perlu diperiksa."
              ]
            },
            {
              "title": "Tinjau dampak operasional",
              "paragraphs": [
                "Periksa status setelah penyimpanan dan kandidat pada papan jadwal. Tinjau sesi/rekap yang masih perlu diproses melalui modul terkait."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.teacherDetail
          ],
          "warning": "Jangan menonaktifkan guru untuk mencoba tombol. Koordinasikan kelas yang masih berjalan dan kebutuhan pemeriksaan akses akun."
        }
      ],
      "expected": [
        "Status operasional guru sesuai tujuan dan perubahan alokasi yang diperlukan sudah diidentifikasi."
      ],
      "systemRules": [
        "Daftar kandidat penjadwalan mengambil guru aktif yang sesuai penugasan.",
        "Mengubah status operasional bukan penghapusan akun/riwayat. Honor periode yang memiliki data sesi tetap harus diperiksa sesuai status dan datanya."
      ],
      "recommendations": [
        "Jangan menganggap tombol status sebagai pengganti prosedur penanganan akses akun. Koordinasikan dengan pengelola akun bila akses perlu dihentikan."
      ],
      "troubleshooting": [
        {
          "question": "Guru tidak ditemukan pada filter tertentu.",
          "answer": "Periksa filter status dan seluruh cabang penugasan. Status non-aktif atau filter cabang/program dapat menyembunyikan kandidat."
        },
        {
          "question": "Guru non-aktif masih tercantum pada rekap lama.",
          "answer": "Periksa apakah guru memiliki sesi atau snapshot pada periode tersebut. Riwayat bukan penugasan baru dan tidak boleh dihapus sekadar untuk merapikan daftar."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
