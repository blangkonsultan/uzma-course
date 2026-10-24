import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_WEBSITE_BASIC = {
  "id": "website-basic",
  "title": "Website: teks, kontak, dan navigasi",
  "articles": [
    {
      "slug": "website-hero",
      "title": "Mengubah Hero Banner",
      "summary": "Atur teks pembuka dan tombol di bagian teratas website tanpa menjanjikan layanan yang tidak tersedia.",
      "keywords": [
        "cms",
        "landing page",
        "hero",
        "headline",
        "badge",
        "cta utama"
      ],
      "prerequisites": [
        "Teks promosi dan tujuan tautan sudah disetujui untuk pengunjung umum."
      ],
      "groups": [
        {
          "id": "hero",
          "steps": [
            {
              "title": "Buka Landing Page → Hero Banner → Edit Konten",
              "paragraphs": [
                "Isi Teks Badge Tagline, Judul Utama (H1), Sub-judul (Unit & Lembaga), dan Deskripsi Pembuka. Tulis informasi ringkas yang akurat untuk orang tua."
              ]
            },
            {
              "title": "Atur checklist dan tombol",
              "paragraphs": [
                "Pada Pill Keunggulan Ringkas, masukkan poin lalu pilih Tambah; gunakan Hapus poin keunggulan untuk item yang tidak lagi diperlukan.",
                "Isi Teks Tombol Utama (WhatsApp), Teks Tombol Sekunder, dan Tautan Tombol Sekunder. Gunakan tujuan yang benar, misalnya #programs untuk bagian program, bukan halaman admin sebagai tautan pengunjung."
              ]
            },
            {
              "title": "Simpan dan periksa website",
              "paragraphs": [
                "Pilih Simpan Perubahan. Setelah kembali ke daftar dengan pesan berhasil, pilih Lihat Website dan periksa hero pada ponsel/desktop, keterbacaan judul, checklist, serta tujuan kedua tombol."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsHero
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Teks hero dan tombol yang baru tampil pada website publik setelah penyimpanan berhasil."
      ],
      "systemRules": [
        "Tambah/hapus checklist di form baru tersimpan ketika Simpan Perubahan dijalankan.",
        "Editor ini mengubah teks tombol, bukan konfigurasi nomor tujuan WhatsApp pada semua tombol situs.",
        "Kembali ke Daftar tidak menyimpan perubahan yang belum dikirim."
      ],
      "recommendations": [
        "Gunakan satu pesan utama dan checklist singkat; hindari klaim hasil belajar yang tidak dapat dipertanggungjawabkan.",
        "Periksa tujuan WhatsApp yang sebenarnya sebelum mengumumkan perubahan kontak."
      ],
      "troubleshooting": [
        {
          "question": "Teks yang diedit belum terlihat publik.",
          "answer": "Pastikan penyimpanan berhasil dan bukan hanya mengisi form lalu kembali. Muat ulang halaman publik; bila ada pesan gagal, perbaiki masalahnya sebelum mencoba menyimpan lagi."
        },
        {
          "question": "Tombol tidak menuju bagian yang diharapkan.",
          "answer": "Periksa Tautan Tombol Sekunder dan anchor/URL yang benar pada website. Jangan mengganti tautan WhatsApp dengan kolom teks tombol."
        }
      ]
    },
    {
      "slug": "website-programs",
      "title": "Mengubah judul Program Belajar",
      "summary": "CMS mengatur judul section; daftar, varian, logo, dan atribusi lisensi program dikelola melalui Master Program.",
      "keywords": [
        "cms programs",
        "master program",
        "judul program",
        "varian",
        "show on landing",
        "logo"
      ],
      "prerequisites": [
        "Judul/subjudul section dan perubahan master program yang diperlukan sudah dibedakan."
      ],
      "groups": [
        {
          "id": "programs",
          "steps": [
            {
              "title": "Buka editor Program Belajar pada Landing Page",
              "paragraphs": [
                "Isi Judul Section dan Sub-judul Section. Perhatikan pemberitahuan Pengelolaan Daftar Program Terpusat."
              ]
            },
            {
              "title": "Gunakan Master Program untuk isi katalog",
              "paragraphs": [
                "Pilih Master Program jika akan mengubah nama, deskripsi, logo, lisensi atau varian program. Periksa status program aktif dan pengaturan tampil pada landing untuk varian yang ingin ditampilkan.",
                "Jangan mencari tombol tambah/hapus program pada form judul section ini; ikuti bab Program Belajar untuk perubahan operasionalnya."
              ]
            },
            {
              "title": "Simpan judul dan periksa hasil",
              "paragraphs": [
                "Kembali ke editor section bila diperlukan, pilih Simpan Perubahan, lalu Lihat Website. Periksa judul dan katalog yang muncul beserta logo, varian, serta atribusinya."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsPrograms
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Judul section tersimpan dan daftar program publik sesuai sumber Master Program yang berlaku."
      ],
      "systemRules": [
        "Form section ini mengirim judul dan subjudul, bukan daftar program bebas.",
        "Katalog aktif berasal dari Master Program; varian publik mengikuti status aktif dan pengaturan tampil pada landing.",
        "Menyimpan judul tidak mengubah biaya atau enrollment murid."
      ],
      "recommendations": [
        "Periksa lisensi/logo sebelum publikasi dan jangan menampilkan varian yang sudah tidak ditawarkan."
      ],
      "troubleshooting": [
        {
          "question": "Nama atau varian program tidak berubah.",
          "answer": "Periksa Master Program, bukan hanya judul CMS. Cek status aktif dan pilihan tampil pada landing untuk varian terkait, lalu muat ulang website."
        },
        {
          "question": "Logo program salah.",
          "answer": "Perbaiki data logo pada Master Program dan pastikan sumber gambar dapat diakses publik serta berizin."
        }
      ]
    },
    {
      "slug": "website-faq",
      "title": "Mengelola FAQ pengunjung",
      "summary": "Tambahkan pertanyaan, jawaban, dan ID yang jelas untuk kebutuhan orang tua, bukan prosedur internal admin/guru.",
      "keywords": [
        "faq",
        "pertanyaan umum",
        "jawaban",
        "slug",
        "urut faq"
      ],
      "prerequisites": [
        "Jawaban sudah disetujui dan sesuai kebijakan operasional terbaru."
      ],
      "groups": [
        {
          "id": "faq",
          "steps": [
            {
              "title": "Buka Landing Page → FAQ",
              "paragraphs": [
                "Isi Judul Section dan Sub-judul Section. Pilih Tambah Pertanyaan FAQ untuk pertanyaan baru, atau buka item yang sudah ada lewat judulnya."
              ]
            },
            {
              "title": "Isi dan susun item",
              "paragraphs": [
                "Lengkapi Pertanyaan, Slug ID (Unik), dan Jawaban. Gunakan ID huruf kecil yang tidak bertabrakan dengan item lain.",
                "Gunakan Pindah ke atas atau Pindah ke bawah untuk urutan. Hapus item mengeluarkan seluruh pertanyaan/jawaban dari form; cek kembali sebelum menyimpan."
              ]
            },
            {
              "title": "Terbitkan dan uji jawaban",
              "paragraphs": [
                "Pilih Simpan Perubahan, lalu Lihat Website. Buka tiap pertanyaan yang berubah dan periksa jawaban serta urutannya pada ponsel."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsFaq
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "FAQ pengunjung menampilkan pertanyaan/jawaban dan urutan yang sudah diperiksa."
      ],
      "systemRules": [
        "Form mengubah ID menjadi huruf kecil dan merapikan spasi tepi saat diisi.",
        "Tombol panah mengubah urutan item; lipat/buka judul hanya mengubah tampilan editor.",
        "Perubahan daftar termasuk penghapusan berlaku setelah disimpan."
      ],
      "recommendations": [
        "Pilih ID unik yang stabil dan jangan memasukkan kredensial atau instruksi akses internal ke FAQ publik."
      ],
      "troubleshooting": [
        {
          "question": "Jawaban terlipat di editor.",
          "answer": "Klik judul item untuk membuka kolomnya. Melipat item tidak menghapus jawabannya."
        },
        {
          "question": "Pertanyaan hilang setelah disimpan.",
          "answer": "Periksa apakah item sempat dihapus dan apakah perubahan sudah diterbitkan. Jangan menyimpulkan isi masih tersimpan hanya karena tidak terlihat pada item yang terlipat."
        }
      ]
    },
    {
      "slug": "website-cta",
      "title": "Mengubah banner Call to Action",
      "summary": "Sesuaikan ajakan konsultasi di bagian bawah halaman dan teks tombol WhatsApp.",
      "keywords": [
        "cta",
        "banner bawah",
        "ajakan",
        "konsultasi",
        "tombol whatsapp"
      ],
      "prerequisites": [
        "Kalimat ajakan dan layanan yang ditawarkan sudah disetujui."
      ],
      "groups": [
        {
          "id": "cta",
          "steps": [
            {
              "title": "Buka Landing Page → Call to Action",
              "paragraphs": [
                "Isi Judul Ajakan (Heading), Sub-judul / Tagline Pendukung, dan Teks Tombol WhatsApp sesuai kebutuhan pengunjung."
              ]
            },
            {
              "title": "Periksa isi sebelum publikasi",
              "paragraphs": [
                "Pastikan teks tombol menerangkan tindakan dengan jelas dan tidak menyiratkan pendaftaran/pembayaran selesai hanya dengan membuka WhatsApp."
              ]
            },
            {
              "title": "Simpan dan periksa bagian bawah website",
              "paragraphs": [
                "Pilih Simpan Perubahan, lalu Lihat Website. Gulir ke banner ajakan, periksa teks pada ponsel dan desktop, lalu pastikan tautan membuka tujuan WhatsApp yang benar tanpa mengirim pesan uji ke pihak lain."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsCta
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Banner ajakan dan label tombol tampil sesuai perubahan yang disimpan."
      ],
      "systemRules": [
        "Form ini mengubah judul, subjudul, dan teks tombol; bukan nomor tujuan WhatsApp situs.",
        "Membuka tautan WhatsApp tidak otomatis mengirim pesan dari server."
      ],
      "recommendations": [
        "Gunakan ajakan yang konkret dan singkat, lalu cocokkan tujuan kontak melalui prosedur pengelola."
      ],
      "troubleshooting": [
        {
          "question": "Nomor tujuan tidak ikut berubah.",
          "answer": "Kolom di sini adalah teks tombol, bukan nomor WhatsApp. Periksa konfigurasi tujuan situs bersama pengelola teknis; jangan menganggap mengganti label sudah mengganti penerima."
        }
      ]
    },
    {
      "slug": "website-footer",
      "title": "Mengelola kontak, media sosial, dan footer",
      "summary": "Periksa nomor tampilan, nomor internasional, akun resmi, dan tautan navigasi sebagai data publik yang berbeda.",
      "keywords": [
        "footer",
        "nomor whatsapp",
        "kontak",
        "instagram",
        "media sosial",
        "tautan footer"
      ],
      "prerequisites": [
        "Nomor dan akun yang akan dipublikasikan adalah kanal resmi yang telah diverifikasi."
      ],
      "groups": [
        {
          "id": "footer",
          "steps": [
            {
              "title": "Buka Landing Page → Footer",
              "paragraphs": [
                "Isi Tagline Footer, Nomor WhatsApp Format Internasional tanpa tanda +, serta Nomor WhatsApp Tampilan (Display) yang mudah dibaca. Gunakan data resmi; screenshot sengaja menampilkan bagian sosial/navigasi, bukan nomor asli."
              ]
            },
            {
              "title": "Atur Media Sosial Resmi",
              "paragraphs": [
                "Pilih Tambah Akun Media Sosial. Tentukan Platform Media Sosial, Nama / Label Tampilan bila perlu, dan Tautan Profil / URL lengkap milik akun resmi.",
                "Buka/lipat item lewat judulnya. Susun dengan Pindah ke atas/Pindah ke bawah atau Hapus item bila akun tidak lagi dipakai."
              ]
            },
            {
              "title": "Atur Tautan Navigasi Footer",
              "paragraphs": [
                "Pilih Tambah Tautan Footer, isi Label Tautan dan Target URL / Anchor, lalu urutkan. Pastikan anchor seperti #programs benar-benar ada dan bukan halaman internal."
              ]
            },
            {
              "title": "Simpan dan cek kanal kontak",
              "paragraphs": [
                "Pilih Simpan Perubahan, lalu Lihat Website. Periksa footer, label nomor, tautan sosial dan navigasi. Uji tujuan kontak secara terpisah; tidak semua tombol WhatsApp situs mengambil nomor dari editor footer."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsFooter
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Kontak/footer publik benar, akun resmi menuju halaman yang tepat, dan navigasinya dapat digunakan."
      ],
      "systemRules": [
        "Nomor internasional dan nomor tampilan adalah dua kolom berbeda.",
        "Daftar sosial/navigasi mendukung tambah, urutkan, dan hapus item sebelum penyimpanan.",
        "Tombol WhatsApp umum menggunakan konfigurasi situsnya sendiri; mengubah footer tidak menjamin semua tujuan tombol ikut berubah."
      ],
      "recommendations": [
        "Konfirmasikan perubahan nomor dengan pengelola teknis agar footer, tujuan tombol, dan kanal resmi tetap konsisten.",
        "Jangan menggunakan URL contoh pada screenshot sebagai tautan akun lembaga."
      ],
      "troubleshooting": [
        {
          "question": "Ikon media sosial tidak menuju akun yang benar.",
          "answer": "Periksa platform dan URL lengkap, bukan hanya label item. Pastikan URL tidak kosong dan akun memang milik lembaga."
        },
        {
          "question": "Nomor tampilan sudah berubah tetapi tombol menuju nomor lama.",
          "answer": "Periksa konfigurasi tujuan tombol situs bersama pengelola. Jangan menyalin nomor tanpa verifikasi atau menganggap semua CTA mengikuti kolom tampilan."
        }
      ]
    },
    {
      "slug": "website-navbar",
      "title": "Mengubah navigasi dan brand header",
      "summary": "Jaga menu publik tetap singkat dan pastikan tujuan setiap anchor atau URL valid.",
      "keywords": [
        "navbar",
        "header",
        "menu",
        "brand",
        "navigasi",
        "anchor"
      ],
      "prerequisites": [
        "Nama brand dan tujuan menu sudah dipastikan benar pada website."
      ],
      "groups": [
        {
          "id": "navbar",
          "steps": [
            {
              "title": "Buka Landing Page → Navigasi",
              "paragraphs": [
                "Isi Nama Brand (Header) dan Teks Tombol Aksi Header. Perubahan teks tombol tidak mengganti konfigurasi nomor WhatsApp."
              ]
            },
            {
              "title": "Isi daftar menu",
              "paragraphs": [
                "Pilih Tambah Menu Navigasi lalu isi Label Menu dan Tautan (Href Anchor / URL). Misalnya #programs menunjuk ke section program pada halaman publik.",
                "Susun memakai Pindah ke atas/Pindah ke bawah. Gunakan Hapus item hanya untuk menu yang memang akan dikeluarkan."
              ]
            },
            {
              "title": "Simpan dan uji navigasi mobile",
              "paragraphs": [
                "Pilih Simpan Perubahan, lalu Lihat Website. Periksa header desktop dan buka menu ponsel; pilih setiap menu untuk memastikan tujuan serta konten tidak tertutup header."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsNavbar
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Brand, tombol, dan menu header tampil dengan urutan dan tujuan yang benar di kedua ukuran layar."
      ],
      "systemRules": [
        "Editor ini mengatur label dan tautan menu, bukan membuat halaman/section baru.",
        "Melipat baris hanya menyembunyikan kolom editor, bukan menonaktifkan menu publik."
      ],
      "recommendations": [
        "Jangan menautkan akses admin/guru sebagai ajakan utama pengunjung atau memasukkan tautan yang belum tersedia."
      ],
      "troubleshooting": [
        {
          "question": "Menu tidak menggulir ke bagian yang benar.",
          "answer": "Periksa ejaan target anchor dan keberadaan section. Mengisi label menu tidak otomatis membuat target yang baru."
        },
        {
          "question": "Tampilan menu terlalu panjang di ponsel.",
          "answer": "Pendekkan label dan batasi menu pada tujuan yang penting, kemudian uji kembali setelah penyimpanan."
        }
      ]
    },
    {
      "slug": "website-floating-wa",
      "title": "Menampilkan atau menyembunyikan tombol WhatsApp",
      "summary": "Pengaturan ini hanya mengendalikan tombol melayang pada website publik.",
      "keywords": [
        "floating wa",
        "tombol melayang",
        "chat",
        "visibilitas",
        "aktifkan whatsapp"
      ],
      "prerequisites": [
        "Keputusan menampilkan tombol cepat dan tujuan kontak sudah diverifikasi."
      ],
      "groups": [
        {
          "id": "floating-wa",
          "steps": [
            {
              "title": "Buka Landing Page → Tombol WhatsApp",
              "paragraphs": [
                "Periksa checkbox Aktifkan Tombol Floating WhatsApp. Centang untuk menampilkan atau hilangkan centang untuk menyembunyikan tombol melayang."
              ]
            },
            {
              "title": "Simpan pilihan",
              "paragraphs": [
                "Pilih Simpan Perubahan. Mengubah checkbox tanpa menyimpan belum menerbitkan pengaturan."
              ]
            },
            {
              "title": "Periksa website publik",
              "paragraphs": [
                "Pilih Lihat Website dan periksa sudut kanan bawah pada ponsel/desktop. Saat aktif, pastikan tombol dapat dijangkau dan menuju kontak resmi; saat nonaktif, tombol melayang tidak tampil."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsFloatingWa
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Visibilitas tombol melayang sesuai pilihan yang sudah disimpan."
      ],
      "systemRules": [
        "Checkbox mengendalikan visibilitas tombol melayang, bukan menonaktifkan seluruh tautan WhatsApp pada hero, menu, atau section lain.",
        "Editor ini tidak menyediakan perubahan nomor penerima atau isi pesan."
      ],
      "recommendations": [
        "Periksa halaman publik, bukan portal admin/guru, ketika menguji pengaturan ini."
      ],
      "troubleshooting": [
        {
          "question": "Tautan WhatsApp lain masih terlihat.",
          "answer": "Itu kontrol terpisah pada section lain. Menyembunyikan tombol melayang tidak menghapus semua CTA WhatsApp."
        },
        {
          "question": "Tombol tidak tampil setelah dicentang.",
          "answer": "Pastikan Simpan Perubahan berhasil, lalu muat ulang halaman publik dan periksa area kanan bawah serta elemen yang mungkin menutupinya."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
