import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_BILLING = {
  "id": "billing",
  "title": "Tagihan SPP dan kwitansi",
  "articles": [
    {
      "slug": "spp-terbitkan-siklus",
      "title": "Menerbitkan tagihan siklus SPP",
      "summary": "Periksa enrollment dan cakupan cabang sebelum menerbitkan invoice. Siklus belajar tidak sama dengan bulan kalender.",
      "keywords": [
        "invoice baru",
        "terbitkan tagihan",
        "28 hari",
        "siklus",
        "jatuh tempo"
      ],
      "prerequisites": [
        "Profil murid dan enrollment aktif sudah diperiksa.",
        "Varian, Nominal SPP, Tanggal Mulai Siklus, serta pengaturan diskon tiap program sudah benar."
      ],
      "groups": [
        {
          "id": "terbitkan",
          "steps": [
            {
              "title": "Buka Tagihan SPP Murid dan pilih cakupan cabang",
              "paragraphs": [
                "Gunakan Filter Cabang untuk menentukan cabang yang akan diperiksa. Semua Cabang berarti cakupan penerbitan tidak dibatasi ke satu cabang.",
                "Pencarian nama atau Filter Status Tagihan bukan pembatas penerbitan per murid; tindakan ini memakai cakupan cabang yang dipilih."
              ]
            },
            {
              "title": "Pilih + Terbitkan Tagihan Siklus hanya setelah siap",
              "paragraphs": [
                "Tombol ini menjalankan pemeriksaan dan penerbitan, bukan membuka pratinjau transaksi. Tunggu hasil pemeriksaan tanpa menekan berulang-ulang."
              ]
            },
            {
              "title": "Periksa invoice yang tersedia",
              "paragraphs": [
                "Baca pesan jumlah tagihan baru atau informasi bahwa siklus berjalan sudah memiliki tagihan. Cocokkan murid, program/varian, nomor siklus, rentang periode, jatuh tempo, potongan, dan totalnya."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.billingList
          ],
          "warning": "Penerbitan membuat catatan invoice. Pastikan cakupan cabang dan data enrollment benar sebelum memilih tombol; jangan menggunakannya sekadar untuk mencoba tampilan."
        }
      ],
      "expected": [
        "Invoice untuk siklus yang belum tercatat tersedia sesuai hasil pemeriksaan.",
        "Hasil nol dapat berarti invoice siklus berjalan sudah ada, bukan kegagalan."
      ],
      "systemRules": [
        "SPP memakai siklus 28 hari yang berawal dari tanggal siklus enrollment, bukan otomatis tanggal yang sama setiap bulan kalender.",
        "Generator memeriksa invoice siklus yang sudah ada agar tidak menerbitkan ulang siklus yang sama.",
        "Nominal dan potongan tersimpan pada invoice saat diterbitkan. Mengubah enrollment kemudian tidak sama dengan memperbarui invoice yang sudah tercatat."
      ],
      "recommendations": [
        "Periksa tanggal awal siklus dan biaya pada semua enrollment murid multi-program sebelum penerbitan.",
        "Jangan menghapus invoice atau mengubah data lama hanya untuk memaksa generator mengulang biaya."
      ],
      "troubleshooting": [
        {
          "question": "Tidak ada tagihan baru.",
          "answer": "Baca pesan hasil pemeriksaan, periksa cabang, status aktif murid/enrollment, tanggal siklus, dan invoice yang sudah tersedia. Jangan menyimpulkan gagal hanya dari angka nol."
        },
        {
          "question": "Nominal invoice tidak sesuai harapan.",
          "answer": "Bandingkan data invoice dengan enrollment saat invoice dibuat. Periksa nominal, diskon dan siklus yang tersimpan; laporkan selisih melalui prosedur operasional, bukan langsung mengubah database."
        }
      ]
    },
    {
      "slug": "spp-cari-tagihan",
      "title": "Mencari dan memeriksa tagihan murid",
      "summary": "Gunakan gabungan cabang, status, dan pencarian agar tidak mencatat pembayaran untuk murid atau invoice yang salah.",
      "keywords": [
        "cari spp",
        "filter cabang",
        "lunas",
        "belum lunas",
        "nomor invoice",
        "multi program"
      ],
      "prerequisites": [
        "Invoice sudah tersedia atau penerbitannya telah diperiksa."
      ],
      "groups": [
        {
          "id": "filter-tagihan",
          "steps": [
            {
              "title": "Atur filter yang relevan",
              "paragraphs": [
                "Buka Tagihan SPP Murid. Pilih Filter Cabang dan Filter Status Tagihan: Semua Status, Belum Lunas, atau Lunas."
              ]
            },
            {
              "title": "Cari dengan identitas yang tepat",
              "paragraphs": [
                "Gunakan Cari tagihan SPP untuk nama murid, nomor induk, atau nomor invoice. Kosongkan kata pencarian/filter yang tidak diperlukan untuk melihat cakupan yang lebih luas."
              ]
            },
            {
              "title": "Periksa baris program dan siklus",
              "paragraphs": [
                "Cocokkan nama, cabang, program/varian, nomor invoice, siklus dan periodenya. Satu murid dapat memiliki lebih dari satu tagihan karena program atau siklus berbeda.",
                "Baca ringkasan sesuai data/filter halaman. Jangan menganggap satu baris program sudah mewakili seluruh kewajiban murid."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.billingList
          ]
        }
      ],
      "expected": [
        "Daftar menampilkan invoice sesuai kombinasi filter dan identitas yang dicari."
      ],
      "systemRules": [
        "Tagihan dan pelunasan dicatat per invoice; satu murid dapat mengikuti beberapa program.",
        "Filter tampilan tidak mengubah status pembayaran.",
        "Tindakan yang ditampilkan bergantung pada status invoice; invoice lunas bukan dicatat ulang sebagai pembayaran baru."
      ],
      "recommendations": [
        "Gunakan nomor invoice sebagai pembanding ketika ada nama mirip atau beberapa siklus pada murid yang sama."
      ],
      "troubleshooting": [
        {
          "question": "Tagihan hilang setelah mengganti filter.",
          "answer": "Periksa kombinasi cabang, status, dan kata pencarian pada halaman/URL. Hapus filter yang tidak cocok sebelum menerbitkan ulang atau membuat data murid baru."
        },
        {
          "question": "Ada beberapa tagihan untuk satu murid.",
          "answer": "Periksa program dan rentang periodenya. Beberapa program/siklus memang menghasilkan beberapa invoice; bedakan dari duplikasi pada program dan siklus yang sama."
        }
      ]
    },
    {
      "slug": "spp-catat-pembayaran",
      "title": "Mencatat pelunasan SPP",
      "summary": "Catat hanya uang yang benar-benar sudah diterima. Form ini melunasi total invoice tersimpan, bukan memasukkan cicilan bebas.",
      "keywords": [
        "catat bayar",
        "pelunasan",
        "tunai",
        "transfer",
        "qris",
        "metode pembayaran",
        "referensi"
      ],
      "prerequisites": [
        "Invoice berstatus belum lunas sudah dipastikan benar.",
        "Pembayaran sungguh sudah diterima dan informasinya dapat dipertanggungjawabkan."
      ],
      "groups": [
        {
          "id": "catat-pelunasan",
          "steps": [
            {
              "title": "Pilih Catat Bayar pada invoice yang benar",
              "paragraphs": [
                "Cocokkan identitas murid, nomor invoice, program, siklus, dan Total Tagihan Pelunasan di dialog sebelum mengisi transaksi."
              ]
            },
            {
              "title": "Isi tanggal dan metode sesuai pembayaran",
              "paragraphs": [
                "Isi Tanggal Pembayaran dan Metode Pembayaran yang sebenarnya: tunai, pilihan transfer bank yang tersedia, QRIS / E-Wallet, atau Lainnya.",
                "Lengkapi Nomor Referensi Transfer / Struk serta Catatan Transaksi bila diperlukan. Jangan menulis kata sandi, PIN, atau rahasia perbankan pada catatan."
              ]
            },
            {
              "title": "Simpan Pembayaran & Terbitkan Kwitansi",
              "paragraphs": [
                "Periksa lagi tanggal, penerima, metode, referensi, dan total. Pilih Simpan Pembayaran & Terbitkan Kwitansi untuk mencatat transaksi.",
                "Setelah berhasil, periksa status invoice dan kwitansi yang muncul. Jika masih ada kesalahan, baca pesan dan cek keadaan tersimpan sebelum mencoba kembali."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.payment
          ],
          "warning": "Tombol simpan mencatat transaksi keuangan dan menerbitkan kwitansi. Batal atau Tutup form pembayaran menutup tanpa menyimpan; jangan menekan simpan untuk menguji sistem."
        }
      ],
      "expected": [
        "Satu pembayaran tercatat untuk invoice yang benar, statusnya menjadi lunas, dan kwitansi dapat diperiksa."
      ],
      "systemRules": [
        "Pelunasan menggunakan total invoice yang tersimpan; form ini tidak menyediakan kolom cicilan atau nominal parsial bebas.",
        "Hanya invoice yang masih belum lunas dapat dibayarkan melalui proses ini. Invoice lunas tidak boleh dicatat ulang.",
        "Tanggal/metode/referensi adalah data pencatatan; memilih metode transfer tidak menjalankan transfer bank.",
        "Potongan pada invoice adalah data tersimpan. Jangan menganggap memilih tanggal pembayaran lain otomatis menghitung ulang diskon invoice."
      ],
      "recommendations": [
        "Cocokkan penerimaan uang dengan bukti dan invoice sebelum menyimpan.",
        "Jika ada kesalahan transaksi, laporkan nomor invoice/kwitansi dan detailnya melalui prosedur pengelola; jangan membuat transaksi palsu untuk mengimbangi kesalahan."
      ],
      "troubleshooting": [
        {
          "question": "Simpan gagal atau koneksi putus.",
          "answer": "Periksa pesan, muat ulang daftar, dan cari invoice yang sama. Jika sudah lunas atau kwitansi sudah ada, jangan mencatat pembayaran kedua."
        },
        {
          "question": "Dana yang diterima belum sebesar total invoice.",
          "answer": "Form ini bukan alur cicilan. Jangan menandai pelunasan yang belum benar-benar diterima; koordinasikan penanganan dengan pengelola keuangan."
        }
      ]
    },
    {
      "slug": "spp-kwitansi",
      "title": "Melihat dan mencetak kwitansi resmi",
      "summary": "Kwitansi diterbitkan dari pembayaran yang sudah tercatat. Periksa identitas dan nomor transaksi sebelum membagikannya.",
      "keywords": [
        "receipt",
        "kwitansi",
        "cetak kwitansi",
        "RCT",
        "bukti pembayaran",
        "lunas"
      ],
      "prerequisites": [
        "Invoice dan pembayaran terkait sudah tercatat sebagai lunas."
      ],
      "groups": [
        {
          "id": "kwitansi",
          "steps": [
            {
              "title": "Temukan invoice lunas",
              "paragraphs": [
                "Buka Tagihan SPP Murid, pilih filter Lunas, lalu cari invoice yang sesuai. Pilih Lihat Kwitansi."
              ]
            },
            {
              "title": "Periksa rincian bukti",
              "paragraphs": [
                "Cocokkan nama murid/wali, nomor invoice dan kwitansi, tanggal bayar, metode, referensi, program, siklus, potongan serta total pelunasan.",
                "Contoh screenshot adalah transaksi demo yang sudah tersedia; bukan transaksi baru yang dibuat untuk panduan."
              ]
            },
            {
              "title": "Pilih Cetak Kwitansi",
              "paragraphs": [
                "Periksa pratinjau browser, ukuran kertas, dan pengaturan header/footer. Cetak atau simpan PDF melalui pilihan browser, lalu bagikan hanya kepada pihak yang berhak."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.receipt
          ]
        }
      ],
      "expected": [
        "Kwitansi yang dicetak atau disimpan sesuai invoice/pembayaran yang dimaksud."
      ],
      "systemRules": [
        "Kwitansi merupakan hasil pencatatan pembayaran; mencetaknya tidak mencatat pembayaran kedua.",
        "Catatan pelunasan berhubungan dengan invoice tertentu, bukan seluruh program murid secara otomatis."
      ],
      "recommendations": [
        "Periksa nomor invoice/kwitansi ketika mengirim ulang bukti agar tidak tertukar antarprogram atau siklus.",
        "Jangan membagikan bukti pembayaran berisi data wali atau murid ke kanal publik."
      ],
      "troubleshooting": [
        {
          "question": "Lihat Kwitansi tidak tersedia.",
          "answer": "Periksa status invoice dan apakah pencatatan pembayaran berhasil. Jangan membuat pembayaran baru hanya untuk memunculkan tombol cetak."
        },
        {
          "question": "URL/tanggal browser ikut tercetak.",
          "answer": "Periksa pengaturan cetak browser dan nonaktifkan Headers and footers bila diperlukan. Gunakan pratinjau sebelum membagikan hasil."
        }
      ]
    },
    {
      "slug": "spp-pengingat",
      "title": "Menyiapkan pengingat WhatsApp",
      "summary": "Tautan pengingat menyusun pesan untuk operator kirim, bukan layanan pengiriman otomatis atau penanda pembayaran.",
      "keywords": [
        "wa",
        "whatsapp",
        "wali",
        "pengingat",
        "pesan",
        "tagihan"
      ],
      "prerequisites": [
        "Kontak wali pada Data Murid sudah benar.",
        "Invoice yang akan diingatkan memang sesuai kondisi pembayaran."
      ],
      "groups": [
        {
          "id": "pengingat",
          "steps": [
            {
              "title": "Periksa invoice dan penerima",
              "paragraphs": [
                "Cari tagihan yang tepat dan periksa statusnya. Cocokkan nomor WhatsApp wali pada data murid sebelum membuka tautan pengingat."
              ]
            },
            {
              "title": "Pilih Kirim WhatsApp",
              "paragraphs": [
                "Gunakan tindakan WhatsApp pada baris invoice. Aplikasi membuka WhatsApp/web/aplikasi terkait dengan pesan yang memuat informasi tagihan."
              ]
            },
            {
              "title": "Tinjau dan kirim di WhatsApp",
              "paragraphs": [
                "Periksa penerima, identitas murid, program, periode, total, serta jatuh tempo. Sesuaikan komunikasi sesuai prosedur lembaga, lalu kirim melalui WhatsApp hanya setelah benar."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.billingList
          ]
        }
      ],
      "expected": [
        "Pesan pengingat yang benar dapat dikirim kepada wali yang tepat melalui WhatsApp."
      ],
      "systemRules": [
        "Tautan WhatsApp tidak mengirim pesan otomatis dari server aplikasi.",
        "Membuka atau mengirim pengingat tidak mengubah invoice menjadi lunas.",
        "Ketersediaan tautan bergantung pada kontak wali yang ada."
      ],
      "recommendations": [
        "Jangan mengirim pengingat untuk transaksi yang sebenarnya sudah lunas tanpa memeriksa catatan terbaru.",
        "Jangan memakai nomor atau identitas pada screenshot demo sebagai tujuan pengiriman."
      ],
      "troubleshooting": [
        {
          "question": "Tautan WhatsApp tidak tersedia atau nomor keliru.",
          "answer": "Periksa Nomor WhatsApp Orang Tua pada Data Murid dan simpan koreksi yang sah. Jangan mengirim pesan ke nomor yang belum dipastikan."
        },
        {
          "question": "WhatsApp tidak terbuka.",
          "answer": "Periksa dukungan aplikasi/browser dan koneksi perangkat. Pencatatan tagihan tidak berubah hanya karena aplikasi pesan gagal dibuka."
        }
      ]
    },
    {
      "slug": "spp-export",
      "title": "Mencetak rekap SPP sesuai filter",
      "summary": "Gunakan rekap kelompok murid untuk membaca beberapa program dalam satu laporan tanpa mencampur cakupan filter.",
      "keywords": [
        "export",
        "rekap",
        "pdf",
        "laporan spp",
        "multi program",
        "sebagian lunas"
      ],
      "prerequisites": [
        "Cabang, status, dan pencarian pada daftar sudah sesuai kebutuhan laporan."
      ],
      "groups": [
        {
          "id": "rekap",
          "steps": [
            {
              "title": "Tentukan cakupan laporan pada daftar",
              "paragraphs": [
                "Atur Filter Cabang, Filter Status Tagihan, dan Cari tagihan SPP sebelum memilih Export Rekap PDF. Cakupan ini berbeda dari penerbitan siklus yang memakai filter cabang."
              ]
            },
            {
              "title": "Periksa Pratinjau Export Rekap SPP",
              "paragraphs": [
                "Cocokkan keterangan cabang/status/pencarian. Murid multi-program ditampilkan sebagai kelompok dengan subbaris program/siklus dan ringkasan nominal.",
                "Periksa rincian subtagihan saat sebagian sudah lunas. Label kelompok sebagian lunas tidak berarti form satu invoice mendukung pembayaran cicilan."
              ]
            },
            {
              "title": "Cetak / Simpan PDF",
              "paragraphs": [
                "Pilih Cetak / Simpan PDF lalu periksa hasil pada pratinjau browser. Pastikan semua baris yang diperlukan dan konteks filter ikut tersimpan sebelum membagikan laporan."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.billingExport
          ]
        }
      ],
      "expected": [
        "Laporan memuat data sesuai filter dengan kelompok murid dan rincian tagihan yang dapat ditelusuri."
      ],
      "systemRules": [
        "Export menggunakan data invoice pada cakupan halaman yang sedang dipilih.",
        "Rekap tidak menerbitkan tagihan, menerima uang, atau mengubah status pembayaran.",
        "Beberapa subtagihan pada satu murid tetap memiliki invoice/statusnya masing-masing."
      ],
      "recommendations": [
        "Baca keterangan filter pada laporan sebelum menganggapnya rekap seluruh cabang/periode.",
        "Bagikan laporan hanya kepada pihak yang berhak karena memuat data murid dan wali."
      ],
      "troubleshooting": [
        {
          "question": "Tombol export tidak aktif.",
          "answer": "Periksa apakah hasil filter memiliki invoice. Kosongkan filter yang tidak relevan bila ingin mengubah cakupan; jangan menerbitkan tagihan baru hanya agar tombol aktif."
        },
        {
          "question": "Jumlah laporan berbeda dari daftar yang sebelumnya dilihat.",
          "answer": "Periksa cabang, status, kata pencarian, serta data yang sudah berubah sejak tampilan sebelumnya. Buka pratinjau setelah filter selesai diterapkan."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
