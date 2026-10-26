import "server-only";
import type { GuideChapter } from "@/types/guides";
import { ADMIN_SCREENSHOTS } from "./screenshots";

export const ADMIN_WEBSITE_MEDIA = {
  "id": "website-media",
  "title": "Website: konten, media, dan lokasi",
  "articles": [
    {
      "slug": "website-why-us",
      "title": "Mengelola Keunggulan Kami",
      "summary": "Gunakan judul, ikon, dan deskripsi untuk menjelaskan keunggulan nyata tanpa data internal.",
      "keywords": [
        "why_us",
        "usp",
        "keunggulan kami",
        "ikon",
        "urut poin"
      ],
      "prerequisites": [
        "Poin keunggulan dan klaim layanan sudah diperiksa kebenarannya."
      ],
      "groups": [
        {
          "id": "why-us",
          "steps": [
            {
              "title": "Buka Landing Page → Keunggulan Kami",
              "paragraphs": [
                "Isi Judul Section dan Sub-judul Section. Buka poin yang sudah ada atau pilih Tambah Poin Keunggulan."
              ]
            },
            {
              "title": "Isi dan susun poin",
              "paragraphs": [
                "Isi Judul Poin, pilih Ikon yang tersedia, lalu isi Deskripsi Poin. Gunakan Pindah ke atas/Pindah ke bawah untuk urutan prioritas.",
                "Hapus item mengeluarkan poin dari daftar form. Periksa ulang isi dan urutan sebelum menyimpan."
              ]
            },
            {
              "title": "Simpan dan periksa kartu publik",
              "paragraphs": [
                "Pilih Simpan Perubahan, lalu Lihat Website. Periksa ikon, judul/deskripsi, urutan dan keterbacaannya pada ponsel."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsWhyUs
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Kartu keunggulan tampil dengan isi, ikon, dan urutan yang sudah diperiksa."
      ],
      "systemRules": [
        "Ikon dipilih dari daftar yang disediakan, bukan unggah gambar bebas pada poin ini.",
        "Tambah/hapus/urutkan berlaku pada daftar section yang disimpan."
      ],
      "recommendations": [
        "Prioritaskan keunggulan yang dapat dibuktikan; hindari angka atau jaminan hasil yang belum disetujui."
      ],
      "troubleshooting": [
        {
          "question": "Kolom poin tidak terlihat.",
          "answer": "Buka judul item yang terlipat. Panah urutkan berbeda dari tombol buka/lipat item."
        },
        {
          "question": "Urutan publik belum berubah.",
          "answer": "Pastikan tombol urutkan sudah digunakan dan Simpan Perubahan berhasil, kemudian muat ulang halaman publik."
        }
      ]
    },
    {
      "slug": "website-facilities",
      "title": "Mengelola daftar Fasilitas",
      "summary": "Publikasikan fasilitas yang benar-benar tersedia dan deskripsikan cakupannya dengan jelas.",
      "keywords": [
        "fasilitas",
        "sarana",
        "ikon fasilitas",
        "daftar fasilitas"
      ],
      "prerequisites": [
        "Ketersediaan dan cakupan fasilitas sudah diverifikasi dengan pengelola cabang."
      ],
      "groups": [
        {
          "id": "facilities",
          "steps": [
            {
              "title": "Buka Landing Page → Fasilitas",
              "paragraphs": [
                "Isi Judul Section dan Sub-judul Section. Pilih Tambah Fasilitas Baru atau buka item yang akan diperbarui."
              ]
            },
            {
              "title": "Isi rincian fasilitas",
              "paragraphs": [
                "Isi Nama Fasilitas, Ikon Fasilitas, dan Deskripsi Fasilitas. Bedakan fasilitas umum dari yang hanya tersedia pada cabang/program tertentu.",
                "Susun dengan Pindah ke atas/Pindah ke bawah. Hapus item hanya bila memang akan dihilangkan dari daftar yang diterbitkan."
              ]
            },
            {
              "title": "Terbitkan dan tinjau",
              "paragraphs": [
                "Pilih Simpan Perubahan, lalu Lihat Website. Periksa kartu fasilitas dan teks panjang di layar ponsel serta desktop."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsFacilities
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Daftar fasilitas publik akurat dan tersusun sesuai prioritas."
      ],
      "systemRules": [
        "Setiap item menggunakan nama, ikon pilihan, dan deskripsi.",
        "Daftar CMS adalah informasi publik, bukan pencatatan inventaris atau perubahan data cabang operasional."
      ],
      "recommendations": [
        "Jangan menampilkan fasilitas yang belum tersedia tanpa keterangan yang jelas."
      ],
      "troubleshooting": [
        {
          "question": "Ikon tidak sesuai fasilitas.",
          "answer": "Buka item dan pilih Ikon Fasilitas yang disediakan, kemudian simpan; mengganti nama tidak otomatis mengganti ikonnya."
        }
      ]
    },
    {
      "slug": "website-team",
      "title": "Mengelola foto tim dan profil pengelola",
      "summary": "Publikasikan profil berizin dan gambar yang dapat dimuat pengunjung tanpa membuka data pribadi internal.",
      "keywords": [
        "team",
        "tim pengajar",
        "pengelola",
        "pendiri",
        "foto",
        "google drive",
        "alt text",
        "nilai"
      ],
      "prerequisites": [
        "Foto, nama, jabatan, dan kutipan telah disetujui untuk publikasi.",
        "Sumber gambar milik lembaga/berizin dan dapat diakses pengunjung."
      ],
      "groups": [
        {
          "id": "team",
          "steps": [
            {
              "title": "Buka Landing Page → Tim & Pengelola",
              "paragraphs": [
                "Isi Judul Section dan Sub-judul Section. Pada Kartu Foto & Tim Pengajar, isi URL Gambar dan Teks Alternatif untuk Foto Tim Pengajar, lalu periksa Preview Thumbnail.",
                "Lengkapi Badge Teks Kartu, Judul Kartu Tim dan Deskripsi Tim Pengajar."
              ]
            },
            {
              "title": "Lengkapi Profil Pendiri / Pengelola",
              "paragraphs": [
                "Isi Foto Pengelola beserta alt text, Nama Lengkap & Gelar, Peran / Jabatan, serta Kutipan Komitmen / Bio. Logo pada screenshot hanya contoh input, bukan foto pengelola yang seharusnya diterbitkan.",
                "Ikuti rekomendasi rasio/kualitas pada form: foto tim landscape 4:3 dan pengelola persegi/portrait. Kolom URL menerima lokasi gambar yang sudah tersedia, bukan memilih file baru untuk diunggah."
              ]
            },
            {
              "title": "Atur Nilai & Komitmen Pengajaran",
              "paragraphs": [
                "Pilih Tambah Kartu Nilai bila dibutuhkan. Isi Judul Nilai, Ikon, dan Deskripsi Singkat; susun dengan panah atau Hapus item yang tidak diperlukan."
              ]
            },
            {
              "title": "Periksa gambar dan terbitkan",
              "paragraphs": [
                "Tautan berbagi Google Drive yang didukung dikonversi ke tautan gambar; pastikan file diizinkan untuk Siapa saja yang memiliki link. Konversi URL tidak mengubah izin file.",
                "Pilih Simpan Perubahan, lalu Lihat Website. Periksa kedua foto, pemotongan gambar, alt text, nama/jabatan dan kartu nilai tanpa login pada sumber gambar."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsTeam
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Foto/profil dan nilai pengajaran tampil benar serta berizin pada website publik."
      ],
      "systemRules": [
        "Foto tim dan pengelola memiliki kolom URL/alt terpisah.",
        "Preview hanya menunjukkan gambar dari URL yang dapat dimuat; bukan bukti izin publikasi.",
        "Data profil CMS bukan akun login guru atau pengaturan peran/kompensasi pada Master Guru."
      ],
      "recommendations": [
        "Gunakan JPG/PNG/WebP sesuai petunjuk form, alt text yang menjelaskan isi, dan foto berizin tanpa dokumen pribadi terlihat.",
        "Uji akses gambar dari browser tanpa login ke penyimpanan sumber sebelum mengumumkan publikasi."
      ],
      "troubleshooting": [
        {
          "question": "Gambar tidak dapat dimuat.",
          "answer": "Periksa URL, izin berbagi file, koneksi dan format gambar. Gunakan tautan file/gambar yang benar; menempel URL folder atau halaman login tidak memberi akses gambar kepada pengunjung."
        },
        {
          "question": "Perubahan profil tidak mengubah akun guru.",
          "answer": "Profil publik CMS dan Master Guru adalah data berbeda. Perubahan akses akun harus melalui alur Data Guru yang sesuai."
        }
      ]
    },
    {
      "slug": "website-gallery",
      "title": "Mengelola kategori dan foto Galeri",
      "summary": "Pisahkan kategori, gambar, dan keterangan. Jangan menerbitkan foto anak atau dokumen tanpa izin.",
      "keywords": [
        "gallery",
        "galeri",
        "lisensi",
        "wisuda",
        "kategori",
        "foto anak",
        "drive",
        "teks alt"
      ],
      "prerequisites": [
        "Setiap foto/dokumen sudah diperiksa izin publikasinya.",
        "URL gambar siap diakses pengunjung tanpa login ke penyimpanan."
      ],
      "groups": [
        {
          "id": "gallery",
          "steps": [
            {
              "title": "Buka Landing Page → Galeri",
              "paragraphs": [
                "Isi Judul Section dan Sub-judul Section. Buka kategori yang ada atau pilih Tambah Kategori Galeri, lalu isi Nama Kategori / Label Grup.",
                "Kategori dapat dipisahkan misalnya Lisensi, Wisuda, dan Kegiatan Guru dan Murid sesuai isi dokumentasi."
              ]
            },
            {
              "title": "Tambahkan foto pada kategori yang tepat",
              "paragraphs": [
                "Pilih Tambah Foto di kategori, isi URL Gambar serta Teks Alt yang menjelaskan foto. Periksa thumbnail setelah meninggalkan kolom URL.",
                "Tautan Drive yang didukung dinormalisasi ketika kolom ditinggalkan. Atur izin file di sumbernya; aplikasi tidak membuka izin Drive secara otomatis. Logo pada screenshot hanya contoh aman untuk mengisi form."
              ]
            },
            {
              "title": "Susun kategori dan periksa penghapusan",
              "paragraphs": [
                "Pindah ke atas/Pindah ke bawah menyusun kategori. Hapus foto mengeluarkan satu foto; Hapus item pada header kategori mengeluarkan kategori beserta koleksinya dari form.",
                "Editor ini tidak menyediakan panah urutan per foto. Jangan mengasumsikan kontrol urutan kategori adalah kontrol foto individual."
              ]
            },
            {
              "title": "Simpan dan periksa galeri publik",
              "paragraphs": [
                "Setelah seluruh foto, kategori, dan alt text diperiksa, pilih Simpan Perubahan lalu Lihat Website. Buka kategori/foto pada galeri dan cek thumbnail maupun tampilan besarnya di ponsel."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsGallery
          ],
          "warning": "Hapus item pada kategori mengeluarkan seluruh koleksi kategori dari form. Simpan Perubahan akan menerbitkan daftar hasil edit. Periksa foto anak, lisensi, alamat, dan dokumen pribadi sebelum publikasi."
        }
      ],
      "expected": [
        "Kategori dan gambar yang diizinkan tampil dengan keterangan yang sesuai tanpa membocorkan informasi pribadi."
      ],
      "systemRules": [
        "Satu kategori menampung beberapa gambar dengan URL dan alt masing-masing.",
        "Preview bergantung pada URL dan akses sumber gambar, bukan sekadar teks yang terisi.",
        "Perubahan termasuk penghapusan belum tersimpan sampai Simpan Perubahan berhasil."
      ],
      "recommendations": [
        "Jangan menerbitkan nomor identitas, rapor, rincian pembayaran, alamat rumah, atau foto anak tanpa persetujuan yang sesuai.",
        "Gunakan kategori/deskripsi yang membantu pengunjung, bukan nama internal file yang sulit dipahami."
      ],
      "troubleshooting": [
        {
          "question": "Thumbnail kosong atau rusak.",
          "answer": "Periksa tautan file gambar, izin publik sumber, dan formatnya. Pada Drive gunakan file yang dibagikan, bukan folder atau tautan yang memerlukan login."
        },
        {
          "question": "Seluruh foto kategori hilang dari form.",
          "answer": "Periksa apakah Hapus item kategori terpilih. Bila belum disimpan, meninggalkan/memuat ulang editor membuang edit yang belum dikirim; jangan Simpan Perubahan jika daftar hasil edit belum benar."
        }
      ]
    },
    {
      "slug": "website-testimonials",
      "title": "Mengelola Testimoni orang tua",
      "summary": "Gunakan kutipan asli yang sudah diizinkan, bukan membuat ulasan seolah berasal dari orang tua.",
      "keywords": [
        "testimoni",
        "ulasan",
        "quote",
        "orang tua",
        "carousel",
        "izin"
      ],
      "prerequisites": [
        "Kutipan, penulisan nama, dan izin publikasi sudah disetujui oleh pihak yang bersangkutan."
      ],
      "groups": [
        {
          "id": "testimonials",
          "steps": [
            {
              "title": "Buka Landing Page → Testimoni",
              "paragraphs": [
                "Isi Judul Section dan Sub-judul Section. Pilih Tambah Testimoni Baru atau buka item pada Daftar Ulasan & Testimoni."
              ]
            },
            {
              "title": "Isi kutipan sesuai sumber",
              "paragraphs": [
                "Lengkapi Nama Orang Tua Murid, Label Program, dan Kutipan Testimoni (Quote). Jangan mengubah makna atau menambah hasil yang tidak disampaikan.",
                "Contoh pada screenshot secara eksplisit adalah data panduan yang tidak diterbitkan, bukan ulasan pelanggan sebenarnya."
              ]
            },
            {
              "title": "Atur daftar lalu terbitkan",
              "paragraphs": [
                "Gunakan Pindah ke atas/Pindah ke bawah untuk urutan carousel dan Hapus item bila persetujuan dicabut/ulasan tidak lagi sesuai.",
                "Pilih Simpan Perubahan, lalu Lihat Website. Periksa kutipan, nama/label dan navigasi carousel di ponsel."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsTestimonials
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Testimoni berizin tampil dengan atribusi dan isi yang benar."
      ],
      "systemRules": [
        "Setiap item berisi nama, label program, dan kutipan; tidak membuat akun wali/murid.",
        "Perubahan item dan urutan diterbitkan melalui Simpan Perubahan."
      ],
      "recommendations": [
        "Gunakan penulisan nama yang telah diizinkan dan jangan menyertakan nomor kontak, data kesehatan, nilai, atau identitas anak yang tidak perlu.",
        "Simpan persetujuan/sumber kutipan melalui prosedur lembaga, bukan memasukkan bukti privat ke teks publik."
      ],
      "troubleshooting": [
        {
          "question": "Teks contoh muncul setelah menambah item.",
          "answer": "Itu isi awal editor, bukan testimoni yang terverifikasi. Ganti dengan kutipan berizin sebelum menyimpan atau hapus item yang belum siap."
        }
      ]
    },
    {
      "slug": "website-videos",
      "title": "Menambahkan video YouTube atau TikTok",
      "summary": "Pilih platform, ambil ID video yang benar, periksa pemutar, lalu terbitkan hanya media publik yang diizinkan.",
      "keywords": [
        "videos",
        "video promo",
        "youtube",
        "shorts",
        "tiktok",
        "shortlink",
        "vt.tiktok.com",
        "vm.tiktok.com",
        "embed"
      ],
      "prerequisites": [
        "Video publik, berizin, dan sesuai untuk website lembaga.",
        "URL/ID berasal dari video yang benar, bukan profil, playlist, atau tautan privat."
      ],
      "groups": [
        {
          "id": "videos",
          "steps": [
            {
              "title": "Buka Landing Page → Video Promo",
              "paragraphs": [
                "Isi Judul Section dan Sub-judul Section. Buka Panduan Cara Mengambil ID Video bila diperlukan, lalu pilih Tambah Video Baru."
              ]
            },
            {
              "title": "Pilih platform dan masukkan ID",
              "paragraphs": [
                "Isi Judul Video dan Platform Video. YouTube menggunakan ID 11 karakter; tautan watch, youtu.be, embed, atau Shorts yang didukung dapat ditempel untuk mengambil ID.",
                "TikTok menggunakan ID numerik video. Tautan lengkap dengan /video/ dapat digunakan; URL dasar player sudah disediakan editor dan tidak perlu diketik dua kali."
              ]
            },
            {
              "title": "Ekstrak shortlink TikTok bila diperlukan",
              "paragraphs": [
                "Untuk tautan HTTPS vt.tiktok.com atau vm.tiktok.com yang terdeteksi, pilih Ekstrak ID Otomatis Sekarang. Tunggu hasil atau baca pesan gagal.",
                "Tautan pendek harus diubah menjadi ID video yang sebenarnya sebelum menyimpan. CONTOH-PANDUAN pada screenshot hanyalah contoh kontrol, bukan tautan video yang valid."
              ]
            },
            {
              "title": "Periksa Preview Player, urutan, dan publikasi",
              "paragraphs": [
                "Pastikan Preview Player memuat video yang dimaksud; Buka Player membantu memeriksa sumbernya. Teks input yang terisi belum membuktikan video valid atau dapat disematkan.",
                "Susun item dengan Pindah ke atas/Pindah ke bawah atau Hapus item, lalu pilih Simpan Perubahan. Buka Lihat Website dan periksa video serta format landscape/vertikal pada ponsel/desktop."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsVideos
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Video yang benar dapat diputar oleh pengunjung, dengan judul, platform, dan urutan sesuai."
      ],
      "systemRules": [
        "Platform yang tersedia adalah YouTube dan TikTok.",
        "Resolusi shortlink memerlukan jaringan dan tautan resmi TikTok HTTPS yang diizinkan; hasil pengalihan harus tetap pada domain TikTok.",
        "Daftar video kosong membuat section video tidak ditampilkan ke pengunjung.",
        "Editor menyusun tautan embed dari input; jangan menganggap semua teks yang diterima kolom sudah merupakan ID yang valid."
      ],
      "recommendations": [
        "Pastikan izin embed dan privasi media di platform sumber, serta persetujuan orang yang terlihat terutama anak.",
        "Jangan menerbitkan shortlink mentah yang belum berhasil diekstrak atau video demo yang tidak dapat diputar."
      ],
      "troubleshooting": [
        {
          "question": "Ekstraksi shortlink gagal.",
          "answer": "Periksa koneksi, HTTPS, domain resmi, dan apakah video publik. Buka sumber TikTok yang benar melalui browser lalu ambil ID dari URL /video/; jangan gunakan situs resolver tidak dikenal."
        },
        {
          "question": "Preview tidak dapat diputar.",
          "answer": "Periksa platform, ID, status publik/izin embed dan koneksi. Coba Buka Player untuk memastikan sumbernya; jangan menyimpan hanya karena kolom tidak kosong."
        }
      ]
    },
    {
      "slug": "website-locations",
      "title": "Mengelola lokasi cabang pada website",
      "summary": "Lokasi publik CMS berbeda dari Master Cabang yang mengatur operasi dan titik presensi.",
      "keywords": [
        "locations",
        "lokasi publik",
        "alamat",
        "google maps",
        "embed peta",
        "master cabang",
        "radius"
      ],
      "prerequisites": [
        "Nama/alamat kantor dan tujuan peta sudah diverifikasi untuk publikasi.",
        "Perubahan informasi publik dibedakan dari koordinat/radius presensi pada Data Cabang."
      ],
      "groups": [
        {
          "id": "locations",
          "steps": [
            {
              "title": "Buka Landing Page → Lokasi Cabang",
              "paragraphs": [
                "Isi Judul Section dan Sub-judul Section. Buka lokasi yang ada atau pilih Tambah Cabang Baru pada daftar CMS. Ini menambah kartu lokasi publik, bukan otomatis membuat Master Cabang."
              ]
            },
            {
              "title": "Isi nama, ID, dan alamat publik",
              "paragraphs": [
                "Lengkapi Nama Cabang, Sub-nama Unit, Kode ID Cabang, dan Alamat Lengkap. Gunakan ID yang unik/stabil serta alamat kantor yang benar, bukan alamat pribadi."
              ]
            },
            {
              "title": "Bedakan dua tautan peta",
              "paragraphs": [
                "Google Maps Embed URL (Iframe) membutuhkan URL untuk disematkan, bukan seluruh kode <iframe>. Tautan Langsung Google Maps dipakai untuk membuka navigasi.",
                "Ambil URL embed dan tautan tempat yang benar dari Google Maps, lalu periksa titik/alamatnya. URL pendek navigasi tidak otomatis sama dengan URL embed."
              ]
            },
            {
              "title": "Susun, simpan, dan periksa website",
              "paragraphs": [
                "Gunakan Pindah ke atas/Pindah ke bawah atau Hapus item untuk daftar lokasi publik. Pilih Simpan Perubahan lalu Lihat Website.",
                "Periksa nama/alamat, peta yang dimuat, dan Buka Google Maps. Bila operasi cabang atau titik/radius presensi juga berubah, perbarui melalui alur Data Cabang yang terpisah."
              ]
            }
          ],
          "screenshots": [
            ADMIN_SCREENSHOTS.cmsLocations
          ],
          "warning": "Simpan Perubahan menerbitkan konten ke website publik, bukan menyimpan draf privat. Periksa izin, identitas, tautan, dan isi sebelum menyimpan. Contoh input pada screenshot tidak diterbitkan."
        }
      ],
      "expected": [
        "Kartu lokasi dan tautan peta publik benar, tanpa mengubah titik presensi melalui CMS."
      ],
      "systemRules": [
        "Lokasi CMS berisi informasi publik terpisah dari Master Cabang operasional.",
        "Map embed dan tautan navigasi memiliki kolom berbeda. Peta segera hadir ditampilkan bila URL embed kosong; tautan navigasi hanya tersedia bila diisi.",
        "Mengubah peta publik tidak otomatis memperbarui latitude/longitude/radius presensi guru."
      ],
      "recommendations": [
        "Jaga konsistensi alamat di CMS dan Data Cabang melalui kedua alurnya; verifikasi lokasi sebelum mengumumkan perubahan.",
        "Jangan menyalin alamat contoh pada screenshot menjadi alamat cabang sebenarnya."
      ],
      "troubleshooting": [
        {
          "question": "Peta tidak dimuat tetapi tautan navigasi bekerja.",
          "answer": "Periksa Google Maps Embed URL (Iframe), bukan hanya Tautan Langsung Google Maps. Pastikan URL mendukung embed dan mengarah ke tempat yang benar."
        },
        {
          "question": "Guru tetap dianggap di luar radius setelah peta CMS diubah.",
          "answer": "CMS publik bukan konfigurasi presensi. Periksa titik koordinat dan Radius Geofence pada Data Cabang melalui admin yang berwenang."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
