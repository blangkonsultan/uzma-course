import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_PAYROLL = {
  "id": "payroll",
  "title": "Penggajian guru",
  "articles": [
    {
      "slug": "payroll-periode",
      "title": "Memilih periode dan membaca rekap honor",
      "summary": "Bedakan periode terbuka, snapshot tertutup, dan periode dibayar sebelum menafsirkan angka penggajian.",
      "keywords": [
        "bulan baru",
        "periode payroll",
        "estimasi",
        "honor",
        "tunjangan",
        "minimum",
        "garansi",
        "open closed paid"
      ],
      "prerequisites": [
        "Data guru, varian honor, dan kartu mengajar sudah diperiksa sesuai pekerjaan periode tersebut."
      ],
      "groups": [
        {
          "id": "pilih-periode",
          "steps": [
            {
              "title": "Buka Penggajian Guru dan pilih bulan",
              "paragraphs": [
                "Gunakan pilihan periode di bagian atas. Periksa bulan/tahun serta label Terbuka, Ditutup, atau Dibayar; jangan hanya membaca total nominal."
              ]
            },
            {
              "title": "Baca komponen pada periode tersebut",
              "paragraphs": [
                "Periksa Total Fee Sesi, Tunjangan Tetap, Adjustment, Grand Total Payroll, dan rekap per guru yang tersedia.",
                "Periode baru/terbuka dapat belum memiliki entry rekap admin; snapshot dibentuk saat penutupan. Angka nol pada rekap yang belum dibentuk bukan bukti bahwa semua guru belum mengajar."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.payrollOpen
          ]
        },
        {
          "id": "bulan-baru",
          "steps": [
            {
              "title": "Buka bulan baru bila memang dibutuhkan",
              "paragraphs": [
                "Pilih Bulan Baru, tentukan tahun/bulan pada Pilih Bulan Baru, lalu pilih Buka Periode hanya bila akan membuatnya. Batal menutup form tanpa membuat periode baru."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.payrollNew
          ]
        },
        {
          "id": "baca-status",
          "steps": [
            {
              "title": "Bedakan hasil final dari estimasi",
              "paragraphs": [
                "Periode terbuka masih menerima data kartu mengajar. Periode Ditutup memakai snapshot; periode Dibayar sudah masuk status akhir sesuai pencatatan admin.",
                "Contoh gambar memakai bulan demo yang berbeda untuk menunjukkan status, bukan perubahan status tanpa tindakan pada bulan yang sama."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.payrollPaid
          ]
        }
      ],
      "expected": [
        "Periode yang dipilih benar dan setiap angka dibaca bersama status serta komponennya."
      ],
      "systemRules": [
        "Satu bulan memiliki satu periode payroll.",
        "Dasar fee sesi berasal dari data kartu mengajar yang dikirim dan nilai payable yang diakui sistem, bukan otomatis setiap catatan presensi datang/pulang.",
        "Total yang tercatat terdiri dari fee sesi, tunjangan tetap, dan adjustment bertanda. Garansi minimum yang terdaftar/disnapshot adalah informasi yang harus ditinjau; jangan menganggap tampilnya nominal itu berarti ada tambahan transaksi otomatis."
      ],
      "recommendations": [
        "Bandingkan jumlah akhir dengan ketentuan kompensasi yang disetujui, termasuk honor minimum terdaftar, sebelum pembayaran. Jika perlu penyesuaian yang sah, gunakan adjustment pada status yang diizinkan.",
        "Periksa bulan/tahun saat guru melaporkan perbedaan angka."
      ],
      "troubleshooting": [
        {
          "question": "Periode belum tersedia atau sudah pernah dibuat.",
          "answer": "Periksa daftar seluruh periode terlebih dahulu. Jangan membuat bulan yang sama sebagai duplikat; gunakan periode yang sudah tersedia."
        },
        {
          "question": "Total belum sesuai harapan.",
          "answer": "Periksa bulan, status, kartu mengajar yang benar-benar dikirim, komponen profil/snapshot, serta adjustment. Laporkan rincian yang berbeda sebelum menutup atau menandai dibayar."
        }
      ]
    },
    {
      "slug": "payroll-penyesuaian",
      "title": "Menambahkan adjustment sebelum pembayaran",
      "summary": "Adjustment ditambahkan pada periode yang sudah Ditutup dan belum Dibayar. Nominal dapat positif atau negatif, dengan alasan yang jelas.",
      "keywords": [
        "adjustment",
        "penyesuaian",
        "bonus",
        "potongan",
        "nominal negatif",
        "alasan"
      ],
      "prerequisites": [
        "Periode sudah Ditutup dan belum Dibayar.",
        "Guru memiliki entry pada periode yang dipilih dan penyesuaian telah diotorisasi."
      ],
      "groups": [
        {
          "id": "adjustment",
          "steps": [
            {
              "title": "Pilih periode tertutup yang benar",
              "paragraphs": [
                "Buka Penggajian Guru dan pilih bulan berlabel Ditutup. Periksa guru serta total yang akan terpengaruh sebelum memilih + Tambah Adjustment."
              ]
            },
            {
              "title": "Isi guru, nominal, dan alasan",
              "paragraphs": [
                "Pada Tambah Adjustment Manual, pilih Pilih Guru, isi Nominal Adjustment (Rp), dan Alasan Adjustment. Nilai positif menambah dan nilai negatif mengurangi.",
                "Nominal harus bukan nol dan alasan harus terisi. Jangan menggunakan angka tanpa tanda/satuan yang sudah dipastikan."
              ]
            },
            {
              "title": "Simpan dan cek total periode",
              "paragraphs": [
                "Pilih Simpan Adjustment hanya setelah benar. Periksa penyesuaian pada guru/periode serta perubahan totalnya. Tutup form penyesuaian atau Batal menutup tanpa menyimpan."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.payrollAdjustment
          ],
          "warning": "Simpan Adjustment mencatat perubahan keuangan pada guru/periode yang dipilih. Periksa tanda plus/minus dan alasan; jangan memakai adjustment palsu untuk menutupi kesalahan yang belum diperiksa."
        }
      ],
      "expected": [
        "Adjustment tercatat pada guru/periode yang benar dan total mencerminkan nilai bertandanya."
      ],
      "systemRules": [
        "Adjustment hanya diizinkan pada periode tertutup sebelum dibayar, bukan pada periode terbuka atau yang sudah dibayar.",
        "Nominal bukan nol dan alasan wajib diisi.",
        "Adjustment tidak mengubah isi historis kartu mengajar atau mentransfer uang."
      ],
      "recommendations": [
        "Gunakan alasan yang dapat ditelusuri dan periksa otorisasi, termasuk jika diperlukan penyelarasan jumlah dengan ketentuan honor minimum.",
        "Jika total menjadi tidak wajar/negatif, selesaikan pemeriksaan sebelum menandai dibayar."
      ],
      "troubleshooting": [
        {
          "question": "Tambah Adjustment tidak muncul.",
          "answer": "Periksa status periode. Pada periode terbuka lakukan pemeriksaan dan proses penutupan yang sah dahulu; pada periode dibayar data tidak boleh diperlakukan seperti periode yang masih dapat disesuaikan."
        },
        {
          "question": "Simpan ditolak.",
          "answer": "Periksa nilai bukan nol, guru, alasan, dan status periode yang mungkin telah berubah. Jangan mengulang bila hasil simpan belum dipastikan; periksa daftar adjustment terlebih dahulu."
        }
      ]
    },
    {
      "slug": "payroll-tutup",
      "title": "Menutup periode menjadi snapshot",
      "summary": "Penutupan membentuk rekap dari data sesi yang diakui dan membekukan komponen periode. Tinjau sebelum konfirmasi.",
      "keywords": [
        "tutup periode",
        "snapshot",
        "kunci",
        "submitted",
        "finalisasi"
      ],
      "prerequisites": [
        "Periode masih Terbuka.",
        "Kartu mengajar yang perlu dihitung sudah dikirim dan data kompensasi guru telah ditinjau."
      ],
      "groups": [
        {
          "id": "tutup",
          "steps": [
            {
              "title": "Periksa periode dan kelengkapan data",
              "paragraphs": [
                "Pilih bulan/tahun yang akan diproses. Koordinasikan kartu mengajar yang belum dikirim; draf yang belum disubmit tidak sama dengan sesi yang masuk perhitungan penutupan."
              ]
            },
            {
              "title": "Buka Tutup Periode Payroll",
              "paragraphs": [
                "Pilih Tutup Periode Payroll untuk membaca Konfirmasi Penutupan Periode Payroll. Batal menutup peringatan tanpa menerapkan penutupan."
              ]
            },
            {
              "title": "Konfirmasi hanya bila siap",
              "paragraphs": [
                "Pilih Konfirmasi Tutup Periode bila memang akan menutup bulan tersebut. Setelah berhasil, periksa status Ditutup, rekap guru, fee, tunjangan, informasi minimum, dan total.",
                "Lakukan adjustment yang diotorisasi pada periode tertutup sebelum menandai pembayaran, bila diperlukan. Jangan menganggap penutupan sama dengan transfer honor."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.payrollClose
          ],
          "warning": "Konfirmasi Tutup Periode mengunci basis data sesi/komponen menjadi snapshot. Tidak ada alur buka-kembali yang ditawarkan pada panduan ini; periksa kelengkapan lebih dahulu."
        }
      ],
      "expected": [
        "Periode berstatus Ditutup dan rekap snapshot dapat ditinjau sebelum pembayaran."
      ],
      "systemRules": [
        "Hanya periode terbuka yang dapat ditutup.",
        "Penutupan memakai kartu mengajar submitted pada rentang periode dan snapshot komponen guru.",
        "Periode Ditutup belum berarti honor sudah dibayarkan; adjustment masih mengikuti aturan statusnya sendiri."
      ],
      "recommendations": [
        "Selesaikan pemeriksaan data dan koordinasi dengan guru sebelum konfirmasi.",
        "Jangan mengubah database atau membuka kunci kartu submitted sebagai cara memperbaiki laporan tanpa prosedur yang sah."
      ],
      "troubleshooting": [
        {
          "question": "Sesi atau guru yang diharapkan tidak masuk.",
          "answer": "Periksa bulan/tahun, tanggal sesi, status submitted, serta data yang diakui. Jangan menutup ulang atau mengubah riwayat langsung; laporkan rincian sesi/guru yang belum sesuai."
        },
        {
          "question": "Tombol penutupan tidak tersedia.",
          "answer": "Periksa status saat ini. Periode yang sudah Ditutup atau Dibayar bukan lagi periode terbuka."
        }
      ]
    },
    {
      "slug": "payroll-bayar",
      "title": "Menandai periode setelah honor dibayar",
      "summary": "Tandai Sudah Dibayar adalah pencatatan status setelah proses pembayaran nyata, bukan perintah transfer bank.",
      "keywords": [
        "paid",
        "dibayar",
        "transfer honor",
        "pelunasan gaji",
        "status akhir"
      ],
      "prerequisites": [
        "Periode sudah Ditutup dan semua penyesuaian yang sah selesai diperiksa.",
        "Pembayaran nyata kepada penerima yang benar telah dilakukan sesuai prosedur lembaga."
      ],
      "groups": [
        {
          "id": "tandai-dibayar",
          "steps": [
            {
              "title": "Periksa periode, guru, dan jumlah akhir",
              "paragraphs": [
                "Pilih periode berstatus Ditutup. Cocokkan total, daftar guru, penyesuaian, data penerima, serta ketentuan kompensasinya dengan bukti pembayaran yang benar."
              ]
            },
            {
              "title": "Pilih Tandai Sudah Dibayar hanya setelah dana dibayarkan",
              "paragraphs": [
                "Tombol ini menerapkan pencatatan status. Jangan menekannya untuk mencoba layar atau sebelum pembayaran nyata selesai."
              ]
            },
            {
              "title": "Periksa status Dibayar",
              "paragraphs": [
                "Setelah berhasil, periksa bulan yang sama berstatus Dibayar. Simpan bukti operasional pembayaran melalui prosedur lembaga; status aplikasi sendiri bukan integrasi verifikasi rekening bank."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.payrollClosed
          ],
          "warning": "Status Dibayar merupakan tahap akhir: data tidak dapat diperlakukan seperti periode yang masih terbuka untuk adjustment. Jangan menandai dibayar bila nominal atau penerimanya belum benar."
        }
      ],
      "expected": [
        "Periode yang benar berstatus Dibayar sesuai pembayaran yang sebenarnya sudah dilakukan."
      ],
      "systemRules": [
        "Hanya periode tertutup dapat ditandai dibayar.",
        "Periode dibayar dikunci dari perubahan yang tidak diizinkan, termasuk penambahan adjustment.",
        "Tombol status tidak melakukan transfer uang atau membatalkan pembayaran."
      ],
      "recommendations": [
        "Periksa rekening dan bukti transfer sebelum penandaan, bukan sesudahnya.",
        "Tanyakan perbedaan data sebelum status akhir; jangan mencoba mengubah riwayat langsung lewat database."
      ],
      "troubleshooting": [
        {
          "question": "Tandai Sudah Dibayar tidak muncul.",
          "answer": "Periksa status periode: yang terbuka belum ditutup, sedangkan yang sudah dibayar tidak memerlukan penandaan ulang."
        },
        {
          "question": "Saya menemukan kesalahan setelah dibayar.",
          "answer": "Catat periode, guru, nominal, dan bukti terkait lalu laporkan melalui prosedur pengelola. Jangan membuat adjustment atau mengubah status/database secara langsung untuk memaksa koreksi yang tidak didukung UI."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
