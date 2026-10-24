import "server-only";
import type { GuideChapter } from "@/types/guides";
import { GURU_SCREENSHOTS } from "./screenshots";

export const GURU_PROFILE = {
  "id": "profile",
  "title": "Akun, kata sandi, dan notifikasi",
  "articles": [
    {
      "slug": "profil-akun",
      "title": "Memeriksa identitas dan akses akun",
      "summary": "Profil menampilkan identitas, email dan peran; rincian penugasan diperiksa melalui jadwal/presensi.",
      "keywords": [
        "profil",
        "nama",
        "email",
        "peran",
        "akun",
        "penugasan",
        "bantuan"
      ],
      "prerequisites": [
        "Sudah masuk dengan akun sendiri."
      ],
      "groups": [
        {
          "id": "profil",
          "steps": [
            {
              "title": "Buka Profil pada menu bawah",
              "paragraphs": [
                "Periksa nama, email dan badge Guru. Jangan melanjutkan aktivitas jika identitas yang tampil bukan milik Anda."
              ]
            },
            {
              "title": "Gunakan tindakan yang tersedia",
              "paragraphs": [
                "Panduan Pengguna membuka panduan ini. Ganti Kata Sandi membuka form kredensial; Notifikasi Perangkat mengelola izin pada perangkat; Keluar mengakhiri sesi."
              ]
            },
            {
              "title": "Laporkan data identitas/penugasan yang salah",
              "paragraphs": [
                "Profil ini bukan form untuk mengedit nama, email, cabang, rekening atau kompensasi sendiri. Periksa lokasi tugas pada Jadwal/Presensi dan hubungi admin untuk koreksi data yang berwenang."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.profile
          ]
        }
      ],
      "expected": [
        "Identitas/akses dipastikan benar dan koreksi diminta lewat alur yang sesuai."
      ],
      "systemRules": [
        "Profil menampilkan identitas, email dan peran, bukan daftar pengaturan cabang tugas.",
        "Mengubah preferensi notifikasi bukan mengubah peran atau penugasan akun."
      ],
      "recommendations": [
        "Gunakan akun pribadi dan verifikasi koreksi informasi sensitif lewat kanal resmi."
      ],
      "troubleshooting": [
        {
          "question": "Cabang tugas tidak tampil pada Profil.",
          "answer": "Periksa Jadwal dan Presensi untuk tugas yang tersedia. Jika salah/belum ada, laporkan kepada admin; tidak ada kolom edit penugasan di halaman Profil ini."
        }
      ]
    },
    {
      "slug": "profil-password-notifikasi",
      "title": "Mengganti kata sandi dan mengatur notifikasi",
      "summary": "Kata sandi berubah pada akun; izin notifikasi bekerja pada browser/perangkat yang sedang digunakan.",
      "keywords": [
        "password",
        "kata sandi",
        "minimal 8",
        "notifikasi",
        "izin",
        "uji coba",
        "tes pengiriman"
      ],
      "prerequisites": [
        "Mengetahui kata sandi lama dan memakai akun sendiri.",
        "Antrean presensi sudah selesai sebelum perubahan yang akan mengakhiri sesi."
      ],
      "groups": [
        {
          "id": "kata-sandi",
          "steps": [
            {
              "title": "Buka Profil → Ganti Kata Sandi",
              "paragraphs": [
                "Isi Kata Sandi Lama, Kata Sandi Baru dan Konfirmasi Kata Sandi Baru. Gunakan kata sandi baru minimal 8 karakter dan konfirmasi yang sama."
              ]
            },
            {
              "title": "Simpan Kata Sandi setelah diperiksa",
              "paragraphs": [
                "Pilih Simpan Kata Sandi. Jika berhasil, aplikasi meminta Anda masuk kembali; gunakan kata sandi baru. Jangan memotret, mengirimkan, atau menuliskan kata sandi pada catatan bantuan."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.password
          ]
        },
        {
          "id": "notifikasi",
          "steps": [
            {
              "title": "Atur Notifikasi Perangkat pada Profil",
              "paragraphs": [
                "Gunakan sakelar Aktifkan notifikasi perangkat. Izinkan permintaan browser bila ingin mengaktifkannya; jika diblokir, perbaiki pengaturan izin situs/browser/perangkat terlebih dahulu."
              ]
            },
            {
              "title": "Gunakan Uji Coba bila didukung",
              "paragraphs": [
                "Saat izin aktif, Tes Pengiriman menampilkan Uji Coba untuk memicu notifikasi ke perangkat itu. Periksa pesan berhasil/gagal dan pengaturan notifikasi OS.",
                "Screenshot menunjukkan kontrol web pada browser uji, bukan bilah notifikasi Android/iOS. Hasil bergantung dukungan browser/perangkat dan bukan bukti pengingat operasional otomatis sudah berjalan."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.notifications
          ]
        }
      ],
      "expected": [
        "Kata sandi dapat dipakai untuk masuk kembali setelah perubahan berhasil, dan status notifikasi pada perangkat dipahami."
      ],
      "systemRules": [
        "Kata sandi lama diperiksa; kata sandi baru minimal 8 karakter dan konfirmasi harus cocok.",
        "Penggantian yang berhasil mengarahkan pengguna keluar untuk masuk kembali.",
        "Izin notifikasi dan preferensinya berlaku pada perangkat/browser; menonaktifkan sakelar aplikasi tidak sama dengan mengubah seluruh izin OS.",
        "Uji Coba adalah diagnostik notifikasi perangkat, bukan pengiriman pesan WhatsApp atau pengingat terjadwal ke murid."
      ],
      "recommendations": [
        "Gunakan kata sandi unik dan jangan membagikan kredensial kepada admin lewat screenshot.",
        "Periksa volume/fokus/do-not-disturb serta izin OS jika notifikasi tidak tampak, tanpa menganggap itu kegagalan transaksi lain."
      ],
      "troubleshooting": [
        {
          "question": "Kata sandi lama salah atau konfirmasi tidak cocok.",
          "answer": "Periksa isian pada form dengan aman. Bila tidak mengetahui kata sandi lama, hubungi admin untuk prosedur pemulihan; jangan mengirimkan kata sandi lama sebagai bukti."
        },
        {
          "question": "Notifikasi tidak didukung atau diblokir.",
          "answer": "Periksa dukungan browser/perangkat dan izin situs di pengaturan. Pada platform tertentu pemasangan ke layar utama mungkin diperlukan; portal tetap dapat digunakan melalui browser sesuai fitur yang didukung."
        },
        {
          "question": "Uji Coba gagal meski sakelar aktif.",
          "answer": "Baca pesan kegagalan, periksa koneksi/Service Worker dan izin browser/OS. Status sakelar bukan jaminan OS menampilkan notifikasi; laporkan perangkat/browser serta pesannya tanpa kredensial."
        }
      ]
    },
    {
      "slug": "keluar",
      "title": "Keluar dengan aman setelah pekerjaan tersimpan",
      "summary": "Selesaikan penyimpanan kartu dan sinkronisasi presensi sebelum mengakhiri sesi.",
      "keywords": [
        "logout",
        "keluar",
        "ganti akun",
        "perangkat bersama",
        "aman",
        "antrean"
      ],
      "prerequisites": [
        "Draft yang diperlukan sudah tersimpan atau kartu sudah dikirim sesuai tujuan.",
        "Antrean presensi pada akun/perangkat ini sudah terkirim dan hasilnya jelas."
      ],
      "groups": [
        {
          "id": "keluar",
          "steps": [
            {
              "title": "Periksa pekerjaan yang belum selesai",
              "paragraphs": [
                "Pastikan tidak hanya mengetik kartu tanpa menyimpan. Pada Presensi, periksa jumlah Antrean dan selesaikan sinkronisasi sebelum keluar."
              ]
            },
            {
              "title": "Buka Profil → Keluar",
              "paragraphs": [
                "Pilih Keluar setelah pekerjaan aman. Periksa halaman login tampil; jangan hanya menutup tab pada perangkat bersama lalu menganggap sesi telah berakhir."
              ]
            },
            {
              "title": "Jaga perangkat dan akun",
              "paragraphs": [
                "Jika akan berganti akun, pastikan akun berikutnya benar sebelum aktivitas baru. Jangan menghapus data situs sebagai pengganti proses keluar saat masih ada data lokal yang belum terkirim."
              ]
            }
          ],
          "screenshots": [
            GURU_SCREENSHOTS.profile
          ],
          "warning": "Jangan keluar/ganti akun atau menghapus data situs ketika antrean presensi belum selesai. Data lokal tidak otomatis menjadi presensi server hanya karena aplikasi ditutup."
        }
      ],
      "expected": [
        "Sesi berakhir pada halaman login tanpa meninggalkan pekerjaan penting yang belum tersimpan/tersinkron."
      ],
      "systemRules": [
        "Keluar mengakhiri sesi dan mengarahkan ke login; tidak mengirim draft kartu atau memaksa seluruh antrean menjadi sukses.",
        "Antrean dipisahkan menurut guru yang masuk dan tetap bergantung perangkat/browser asal."
      ],
      "recommendations": [
        "Selalu keluar dari perangkat bersama setelah pekerjaan aman dan jangan menyimpan kata sandi pada perangkat yang tidak dikuasai."
      ],
      "troubleshooting": [
        {
          "question": "Masih ada antrean saat harus menutup perangkat.",
          "answer": "Prioritaskan memulihkan koneksi pada perangkat/akun asal. Jika belum selesai, jangan menghapus penyimpanan; laporkan jumlah antrean, waktu, dan keadaan koneksi kepada admin."
        },
        {
          "question": "Halaman lama terlihat setelah keluar.",
          "answer": "Periksa apakah halaman terlindung meminta login ketika dibuka kembali. Jangan menganggap tampilan yang masih tersisa di tab sebagai sesi kerja yang aman untuk dipakai orang lain."
        }
      ]
    }
  ]
} as const satisfies GuideChapter;
