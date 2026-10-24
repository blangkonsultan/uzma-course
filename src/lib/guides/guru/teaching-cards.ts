import "server-only";
import type { GuideChapter } from "@/types/guides";
import { GURU_SCREENSHOTS } from "./screenshots";

export const GURU_TEACHING_CARDS = {
  "id": "teaching-cards",
  "title": "Kartu mengajar dan status murid",
  "articles": [
    {
      "slug": "kartu-isi",
      "title": "Mengisi kartu mengajar pada tanggal yang benar",
      "summary": "Periksa kelas/tanggal dan isi status setiap murid beserta capaian atau catatan yang relevan.",
      "keywords": [
        "kartu",
        "status murid",
        "hadir",
        "tidak hadir",
        "izin",
        "cancel",
        "capaian",
        "catatan guru",
        "tanggal"
      ],
      "prerequisites": [
        "Kelas berasal dari jadwal akun sendiri dan murid telah ditempatkan admin.",
        "Tanggal serta kejadian pertemuan dapat dipertanggungjawabkan."
      ],
      "groups": [
        {
          "id": "isi-kartu",
          "steps": [
            {
              "title": "Buka kartu dari Jadwal",
              "paragraphs": [
                "Pilih hari/kelas, lalu Isi Kartu Mengajar. Cocokkan cabang, program/varian, jam dan tanggal pada header kartu."
              ]
            },
            {
              "title": "Tetapkan tanggal sesi yang benar",
              "paragraphs": [
                "Gunakan tanggal pertemuan sesuai hari jadwal kelas, tidak di masa depan menurut tanggal WIB. Mengganti tanggal membuka data sesi tanggal itu; jangan menulis dahulu lalu berpindah tanggal tanpa menyimpan pekerjaan yang diperlukan."
              ]
            },
            {
              "title": "Isi status dan catatan tiap murid",
              "paragraphs": [
                "Pilih Status Kehadiran untuk setiap murid: Hadir, Tidak Hadir, Izin, atau Cancel sesuai kejadian sebenarnya.",
                "Isi Capaian dan Catatan guru seperlunya dengan bahasa profesional. Periksa semua murid di bawah, bukan hanya yang terlihat pada layar pertama."
              ]
            },
            {
              "title": "Periksa ulang sebelum menyimpan atau mengirim",
              "paragraphs": [
                "Bandingkan identitas murid, tanggal, status dan catatannya. Gulir sampai tombol di bawah terlihat jelas di atas navigasi. Pilih Simpan Draft jika masih perlu diperiksa, atau ikuti panduan Kirim Kartu jika sudah final."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.cardDraft
          ]
        }
      ],
      "expected": [
        "Kartu berisi data pertemuan yang benar untuk seluruh murid pada kelas/tanggal tersebut."
      ],
      "systemRules": [
        "Tanggal sesi tidak boleh di masa depan dan harus sesuai hari jadwal kelas.",
        "Status yang tersedia adalah Hadir, Tidak Hadir, Izin, dan Cancel; jangan mengganti salah satunya dengan status yang tidak tersedia.",
        "Status seluruh murid wajib diisi sebelum kartu dikirim.",
        "Fee Snapshot pada baris murid bukan bukti bahwa semua status menghasilkan fee; perhitungan sesi saat ini mengakui Hadir, sedangkan status lainnya tidak menambah fee sesi standar."
      ],
      "recommendations": [
        "Jangan memasukkan informasi sensitif yang tidak perlu ke catatan, dan jangan menandai Hadir hanya untuk menaikkan honor.",
        "Jika murid belum ada atau kelas keliru, hubungi admin untuk penempatan; jangan memakai identitas murid lain."
      ],
      "troubleshooting": [
        {
          "question": "Tanggal ditolak.",
          "answer": "Periksa format/tanggal yang dipilih, hari jadwal kelas, dan batas hari ini WIB. Jangan mengubah jam perangkat untuk melewati aturan."
        },
        {
          "question": "Murid tidak muncul pada kartu.",
          "answer": "Periksa Daftar Murid pada jadwal dan laporkan penempatan kelas/enrollment ke admin. Jangan mengirim kartu kelas kosong sebagai pengganti kelas yang seharusnya memiliki murid."
        }
      ]
    },
    {
      "slug": "kartu-simpan-draft",
      "title": "Menyimpan dan melanjutkan draft kartu",
      "summary": "Simpan Draft menyimpan pekerjaan ke server tanpa mengirimnya sebagai kartu final.",
      "keywords": [
        "draft",
        "draf",
        "simpan draft",
        "lanjutkan",
        "reload",
        "belum dikirim"
      ],
      "prerequisites": [
        "Kartu kelas/tanggal yang benar masih dapat diedit.",
        "Koneksi server tersedia; tidak ada jaminan antrean offline untuk kartu mengajar."
      ],
      "groups": [
        {
          "id": "simpan-draft",
          "steps": [
            {
              "title": "Periksa isian lalu pilih Simpan Draft",
              "paragraphs": [
                "Gulir sampai tombol Simpan Draft terlihat jelas di atas navigasi. Pilih satu kali dan tunggu hasil penyimpanan, bukan langsung berpindah halaman."
              ]
            },
            {
              "title": "Pastikan pesan tersimpan muncul",
              "paragraphs": [
                "Periksa pesan Draft kartu mengajar tersimpan. Jika ada pesan gagal, simpan informasi masalah dan jangan menganggap isian telah tersimpan di server."
              ]
            },
            {
              "title": "Buka kembali kelas dan tanggal yang sama",
              "paragraphs": [
                "Buka dari Jadwal dan periksa tanggal. Data draft yang berhasil disimpan dapat dilanjutkan selama kartu belum submitted. Simpan lagi setelah perubahan baru atau gunakan Kirim Kartu ketika sudah final."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.cardSaved
          ]
        }
      ],
      "expected": [
        "Draft tetap ada setelah dibuka kembali dan belum berstatus Submitted."
      ],
      "systemRules": [
        "Simpan Draft berbeda dari Kirim Kartu; draft belum menjadi sesi submitted untuk rekap honor.",
        "Draft dapat belum lengkap, tetapi aturan tanggal/status yang valid tetap berlaku.",
        "Antrean offline presensi tidak menyimpan draft kartu mengajar secara otomatis."
      ],
      "recommendations": [
        "Jangan meninggalkan halaman atau mengganti tanggal sebelum hasil simpan jelas.",
        "Periksa isi yang tersimpan kembali, terutama setelah koneksi terputus atau mencoba ulang."
      ],
      "troubleshooting": [
        {
          "question": "Isian hilang setelah berpindah tanggal.",
          "answer": "Periksa apakah tanggal/kelas yang dibuka sama dan apakah pesan berhasil simpan pernah muncul. Isian yang hanya diketik tanpa penyimpanan tidak sama dengan draft tersimpan."
        },
        {
          "question": "Simpan gagal saat offline.",
          "answer": "Pulihkan koneksi dan pertahankan halaman/isian bila memungkinkan. Jangan menganggap data masuk antrean presensi; periksa pesan dan simpan kembali setelah jaringan stabil."
        }
      ]
    },
    {
      "slug": "kartu-kirim-lihat",
      "title": "Mengirim kartu dan membaca kartu Submitted",
      "summary": "Kirim Kartu menyimpan isian saat ini lalu menguncinya. Pastikan semua murid dan tanggal benar sebelum tindakan final.",
      "keywords": [
        "kirim kartu",
        "submitted",
        "terkunci",
        "lihat kartu",
        "final",
        "koreksi",
        "honor"
      ],
      "prerequisites": [
        "Status seluruh murid sudah terisi dengan benar.",
        "Tanggal, kelas, capaian dan catatan sudah diperiksa; koneksi tersedia."
      ],
      "groups": [
        {
          "id": "kirim",
          "steps": [
            {
              "title": "Tinjau semua baris, bukan hanya layar pertama",
              "paragraphs": [
                "Cocokkan kelas/tanggal dan identitas setiap murid. Pastikan pilihan Hadir/Tidak Hadir/Izin/Cancel sesuai kejadian, termasuk murid di bagian bawah."
              ]
            },
            {
              "title": "Pilih Kirim Kartu hanya ketika final",
              "paragraphs": [
                "Gulir sampai tombol terlihat jelas, lalu pilih Kirim Kartu. Tindakan ini menyimpan perubahan saat ini sebelum mengirim, jadi tidak mengabaikan edit terakhir yang belum disimpan sebagai draft."
              ]
            },
            {
              "title": "Periksa pesan hasil dan status Submitted",
              "paragraphs": [
                "Pastikan pesan Kartu mengajar berhasil dikirim dan badge Submitted tampil. Jika gagal, baca pesan serta periksa keadaan yang tersimpan sebelum mengulang; jangan berasumsi kartu terkirim hanya karena draft sempat tersimpan."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.cardSaved
          ],
          "warning": "Kirim Kartu mengunci catatan sebagai Submitted. Jangan mengirim untuk mencoba tombol atau sebelum seluruh data pertemuan diperiksa."
        },
        {
          "id": "lihat-kartu",
          "steps": [
            {
              "title": "Baca kembali lewat Lihat Kartu Mengajar",
              "paragraphs": [
                "Kembali ke Jadwal dan gunakan Lihat Kartu Mengajar pada sesi yang sudah dikirim. Periksa tanggal serta isi yang kini hanya-baca."
              ]
            },
            {
              "title": "Laporkan kesalahan tanpa membuka kunci sendiri",
              "paragraphs": [
                "Jika menemukan kesalahan setelah submitted, catat kelas, tanggal, murid dan rincian koreksi yang diperlukan lalu hubungi admin. Tidak ada alur buka-kembali/unsubmit yang dijanjikan pada panduan ini; jangan mengubah database langsung."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.cardSubmitted
          ]
        }
      ],
      "expected": [
        "Kartu berstatus Submitted dan isinya dapat ditinjau tanpa berubah sebagai sumber rekap."
      ],
      "systemRules": [
        "Kirim Kartu menyimpan isian terakhir terlebih dahulu lalu melakukan pengiriman.",
        "Submitted mengunci perubahan pada kartu; simpan draft tidak sama dengan status ini.",
        "Perhitungan honor menggunakan data submitted yang diakui, dengan aturan status kehadiran serta periode; bukan sekadar jumlah tombol yang pernah ditekan."
      ],
      "recommendations": [
        "Periksa sebelum kirim dan laporkan masalah spesifik, bukan meminta perubahan riwayat tanpa jejak."
      ],
      "troubleshooting": [
        {
          "question": "Kirim ditolak karena status murid.",
          "answer": "Buka seluruh baris dan isi status yang belum dipilih. Jangan memberi status sembarang hanya agar lolos."
        },
        {
          "question": "Setelah submit, kolom tidak bisa diedit.",
          "answer": "Itu keadaan Submitted yang memang hanya-baca. Laporkan sesi/tanggal dan koreksi kepada admin, tanpa menjanjikan tindakan unsubmit atau membuka kunci lewat database."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
