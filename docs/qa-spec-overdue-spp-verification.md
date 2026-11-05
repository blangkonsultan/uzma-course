# Spesifikasi Skenario Pengujian: Indikator SPP Jatuh Tempo Guru

Dokumen ini memuat panduan pengujian manual langkah-demi-langkah (*test scenario matrix*) untuk memverifikasi fitur penanda SPP jatuh tempo pada portal Guru PWA dan integrasinya dengan modul Admin SPP.

**Kontrak aktif 2026-11-04:** Guru hanya menerima agregat melalui RPC terotorisasi `get_teacher_overdue_spp(p_class_ids)` untuk kelas aktif miliknya dan program kelas itu, bukan baris invoice/payment mentah. Agregasi seluruh invoice dilakukan di PostgreSQL sebelum batas respons. Adapter jadwal/kartu memakai urutan deterministik dan halaman 1.000 grup hingga selesai. Roster minimal ID/nama/NIS dibaca lewat `get_teacher_class_students(p_class_ids)`, juga dipaginasi dan tetap mengizinkan kelas historis milik guru/cabang sekunder tanpa saldo berjalan. Tidak ada perluasan akses finansial cabang umum. Rancangan raw-query lama digantikan oleh [spesifikasi financial safety §4](superpowers/specs/2026-11-04-financial-safety-and-minimum-income-design.md).

**Pelaksanaan:** Semua skenario adalah prosedur, bukan bukti PASS. Gunakan fixture milik run yang unik di lingkungan lokal disetujui untuk penulisan/pembayaran/pagination besar; jangan meminjam profil operasional, reset/reseed, mengirim pesan WA, atau membagikan JWT. Tandai NOT_RUN/BLOCKED bila prasyarat belum ada. Tidak adanya peringatan bukan konfirmasi pembayaran; galat enrichment harus dicatat, bukan ditafsirkan sebagai semua tagihan lunas.

---

## Ringkasan Akun Pengujian

| Peran | Akun / Email | Kata Sandi | Kondisi Data Uji |
|---|---|---|---|
| **Admin** | `admin@uzmacourse.com` | `admin123456` | Pengelola data master, pencatatan pembayaran, dan jalur resmi WhatsApp. |
| **Guru A** | `guru.demo.01@uzmacourse.test` | `guru123456` | Mengajar kelas yang memiliki murid dengan tagihan SPP jatuh tempo (`status = unpaid`, `due_date < hari_ini`). |
| **Guru B** | `guru.demo.02@uzmacourse.test` | `guru123456` | Mengajar kelas dengan seluruh murid berstatus aman (sudah lunas atau belum jatuh tempo). |

---

## 1. Skenario untuk Akun Guru A (Ada Murid Jatuh Tempo)

Tujuan: Memastikan guru memperoleh informasi jatuh tempo yang jelas, mudah dibaca, dan tidak mengganggu proses belajar-mengajar.

### Skenario A1: Indikator Ringkas pada Header Kelas (Jadwal)
- **Halaman:** `/guru/jadwal`
- **Langkah:**
  1. Masuk (*login*) sebagai Guru A.
  2. Buka menu **Jadwal**.
  3. Pilih hari aktif di mana terdapat murid yang memiliki tunggakan SPP.
- **Hasil yang Diharapkan:**
  - Header kartu kelas menampilkan *pill badge* amber:
    `<AlertTriangle> 1 Jatuh Tempo` (atau jumlah murid yang menunggak).
  - Warna kontras teks amber mudah terbaca (`text-amber-800` di atas `bg-amber-100`).
  - Tidak ada karakter emoji literal yang tidak konsisten.

### Skenario A2: Rincian Tagihan pada Daftar Murid (Jadwal)
- **Halaman:** `/guru/jadwal`
- **Langkah:**
  1. Klik tombol akordeon **Daftar Murid (X)** pada kartu kelas tersebut.
- **Hasil yang Diharapkan:**
  - Tinggi tombol akordeon memenuhi target sentuh minimal 44px (`min-h-11`).
  - Daftar murid terbuka ke bawah:
    - Murid yang **tidak menunggak**: Hanya menampilkan nama dan nomor induk murid.
    - Murid yang **menunggak**: Di bawah nama murid terdapat kotak info amber (`border-amber-200 bg-amber-50 rounded-xl`):
      - Ikon segitiga peringatan Lucide.
      - Teks: `{X} tagihan jatuh tempo sejak {Tanggal Indo}` (khusus untuk program kelas yang sedang dibuka, misal kelas AHE hanya menampilkan tagihan program AHE).
      - Nominal uang terformat rapi dengan font seragam: `Rp [Nominal]` (`tabular-nums`).
  - **Batasan Akses:** **TIDAK ADA** tombol WhatsApp atau tautan penagihan mandiri bagi guru (komunikasi pesan WA tetap eksklusif hak Admin).

### Skenario A3: Penanda Peringatan pada Kartu Mengajar
- **Halaman:** `/guru/mengajar/[id]`
- **Langkah:**
  1. Klik tombol **Isi Kartu Mengajar** pada kelas terkait.
  2. Periksa kartu murid yang menunggak SPP.
- **Hasil yang Diharapkan:**
  - Tepat di bawah nama murid dan di atas pilihan status presensi, terdapat kotak peringatan kompak:
    `SPP jatuh tempo: {Tanggal Indo} · Rp {Nominal}`.
  - Teks tidak terpotong (*no clipping/truncate*), fleksibel membungkus baris (*multi-line wrap*) pada layar ponsel sempit (360px).

### Skenario A4: Kelancaran Proses Pengisian Presensi
- **Halaman:** `/guru/mengajar/[id]`
- **Langkah:**
  1. Pilih status kehadiran murid (misal: *Hadir*).
  2. Isi capaian belajar dan catatan guru.
  3. Klik tombol **Simpan Draft** atau **Kirim Kartu**.
- **Hasil yang Diharapkan:**
  - Keberadaan penanda SPP jatuh tempo **tidak mengunci** atau menghambat pengiriman kartu mengajar.
  - Sesi mengajar berhasil disimpan atau dikirim (*Submitted*).

---

## 2. Skenario untuk Akun Guru B (Status SPP Murid Bersih / Lunas)

Tujuan: Memastikan antarmuka tidak menampilkan peringatan palsu (*false positive*) ketika tidak ada murid yang menunggak.

### Skenario B1: Kartu Jadwal Bersih Tanpa Badge
- **Halaman:** `/guru/jadwal`
- **Langkah:**
  1. Masuk (*login*) sebagai Guru B.
  2. Buka menu **Jadwal**.
- **Hasil yang Diharapkan:**
  - Header kartu kelas hanya menampilkan tombol standar *Daftar Murid (X)*.
  - Tidak ada *badge* `Jatuh Tempo` sama sekali di header kelas.

### Skenario B2: Daftar Murid Tanpa Kotak Peringatan
- **Halaman:** `/guru/jadwal`
- **Langkah:**
  1. Buka akordeon **Daftar Murid (X)**.
- **Hasil yang Diharapkan:**
  - Seluruh baris murid tampil bersih dengan border netral `border-slate-200/80`.
  - Tidak ada kotak info amber atau nominal tunggakan yang muncul.

### Skenario B3: Kartu Mengajar Bebas Peringatan
- **Halaman:** `/guru/mengajar/[id]`
- **Langkah:**
  1. Buka formulir Kartu Mengajar Guru B.
- **Hasil yang Diharapkan:**
  - Seluruh kartu murid hanya memuat nama, nomor induk, *Fee Snapshot*, dan kolom presensi biasa tanpa ada kotak peringatan SPP.

---

## 3. Skenario untuk Akun Admin (Pengawasan & Siklus Penagihan)

Tujuan: Memverifikasi alur verifikasi silang (*cross-role verification*) di mana aksi Admin langsung menyelaraskan tampilan guru.

### Skenario F: Pengecekan Dasbor Tagihan SPP
- **Halaman:** `/admin/spp`
- **Langkah:**
  1. Masuk (*login*) sebagai Admin.
  2. Buka menu **SPP Murid**.
- **Hasil yang Diharapkan:**
  - Dasbor menampilkan KPI `Total Tertagih`, `Total Terbayar`, `Sisa Piutang`, dan `Murid Belum Bayar`.
  - Murid dari Guru A tercatat dalam daftar dengan status filter `Belum Lunas` (*Unpaid*) dan tanggal jatuh tempo lampau.

### Skenario G: Pengiriman Pesan Resmi WhatsApp (Hanya Admin)
- **Halaman:** `/admin/spp`
- **Langkah:**
  1. Klik tombol **Ingatkan WA** pada baris tagihan murid yang menunggak.
- **Hasil yang Diharapkan:**
  - Sistem membuka tautan WhatsApp resmi (`https://wa.me/...`) yang ditujukan ke nomor HP wali murid dengan template pesan sopan dari Uzma Course.
  - Membuktikan bahwa wewenang penagihan digital tetap berada di tangan Admin.

### Skenario H: Pencatatan Pembayaran & Pembaruan setelah Muat Ulang
- **Halaman:** `/admin/spp` $\rightarrow$ `/guru/jadwal`
- **Langkah:**
  1. Di akun Admin, klik tombol **Catat Bayar** pada tagihan murid Guru A.
  2. Pilih metode pembayaran (misal: *Transfer Bank* / *Tunai*), lalu konfirmasi **Simpan Pembayaran**.
  3. Status tagihan berubah menjadi `Lunas` (*Paid*).
  4. Beralih ke peramban akun Guru A dan muat ulang (*refresh*) halaman `/guru/jadwal`.
- **Hasil yang Diharapkan:**
  - Setelah muat ulang, badge/kotak hilang bila tidak ada lagi invoice overdue pada program tersebut; bila masih ada, total/jumlah/tanggal paling awal diperbarui sesuai sisanya.
  - Jadwal dan kartu mengajar yang dimuat ulang menampilkan agregat yang sama; tidak mengklaim push real-time pada halaman yang belum dimuat ulang.

### Skenario I: Penerbitan Siklus Tagihan Baru (Tagihan Belum Jatuh Tempo)
- **Halaman:** `/admin/spp` $\rightarrow$ `/guru/jadwal`
- **Langkah:**
  1. Di akun Admin, klik tombol **Terbitkan Tagihan Siklus**.
  2. Sistem menerbitkan tagihan siklus 28 hari berikutnya dengan batas waktu (`due_date`) di masa depan (misal: 2 minggu lagi).
  3. Buka akun Guru A atau Guru B yang memiliki murid dengan tagihan baru tersebut.
- **Hasil yang Diharapkan:**
  - Tagihan baru yang belum melewati tanggal jatuh tempo **TIDAK memicu** penanda jatuh tempo di akun guru.
  - Murid tetap berstatus aman karena kriteria jatuh tempo adalah `due_date < hari_ini_wib`.

---

## 4. Matriks Ringkasan Validasi Cepat

| Pengujian | Lokasi / Akun | Masukan / Aksi | Kriteria Lolos (Pass) |
|---|---|---|---|
| **P1** | Guru A (`/guru/jadwal`) | Lihat kelas ada tunggakan | Badge amber `X Jatuh Tempo` muncul di header. |
| **P2** | Guru A (`/guru/jadwal`) | Klik "Daftar Murid" | Rincian jumlah lembar tagihan, tgl jatuh tempo, & nominal Rp tampil. |
| **P3** | Guru A (`/guru/mengajar/[id]`) | Buka kartu mengajar | Notice banner amber muncul di atas presensi murid. |
| **P4** | Guru B (`/guru/jadwal`) | Lihat kelas tanpa tunggakan | Bebas badge dan kotak peringatan (*clean state*). |
| **P5** | Admin (`/admin/spp`) | Klik "Catat Bayar" murid Guru A | Setelah lunas, penanda di Guru A otomatis hilang. |
| **P6** | Mobile View (360px) | Perkecil viewport ke 360px | 0 horizontal scrollbar, teks wrap natural, touch target $\ge 44$px. |

## 5. Otorisasi, Histori, dan Kelengkapan (tambahan 2026-11-04)

| ID | Prasyarat dan aksi | Hasil yang harus diamati |
|---|---|---|
| **J1** | Guru JWT/public key; invoice dan payment milik fixture diketahui ada melalui kontrol admin. Minta raw `student_invoices` dan `student_payments` di cabang utama/sekunder/lain. | Guru menerima kosong/ditolak di semua cabang, admin tetap dapat membaca. Redirect halaman bukan bukti RLS. |
| **J2** | Panggil RPC summary dengan kelas aktif sendiri, kelas guru lain, kelas arsip, ID berulang, murid sama pada program berbeda. Coba anon, admin, dan service tanpa UID. | Hanya pemanggil guru terautentikasi mendapat agregat own active class/student/program; ID/placement ganda tidak menggandakan uang. Aktor lain ditolak; kelas asing/arsip tidak menghasilkan saldo. Tidak ada notes, receipt, kontak wali, atau raw invoice. |
| **J3** | Buka jadwal/kartu kelas sendiri pada cabang utama dan sekunder dengan murid pindahan; buka kartu arsip sendiri, termasuk yang muridnya juga masuk kelas aktif. | Jadwal/kartu aktif setara tanpa mengandalkan branch snapshot invoice. Kartu arsip tetap memuat roster minimal dan sesi historis tanpa saldo berjalan atau financial RPC; kepemilikan metadata tidak membuka data cabang umum. |
| **J4** | Fixture lokal disetujui berisi 1.001 invoice overdue untuk satu pasangan student/program, lalu >1.000 grup summary terotorisasi dan >1.000 baris roster. Tally independen jumlah, total, earliest date; muat kedua layar dan halaman API. | Seluruh invoice dijumlah sebelum pembatasan respons; semua halaman grup/roster dibaca urut sampai selesai, tanpa duplikasi/truncation. Gagal halaman summary tidak menghasilkan total parsial; gagal roster adalah error baca eksplisit, bukan kelas kosong sukses. |
| **J5** | Kedua peran pada 360px, 375px, lebar menengah, 1280px+; baca saldo besar dan nama panjang, keyboard/touch. | Nominal Rp + angka tetap bersama (NBSP), `whitespace-nowrap`/`tabular-nums`; teks panjang membungkus, tanpa overflow dokumen. Kontrol mobile ≥44px; kontras terukur dan fokus terlihat. |

Catat URL/status/hasil readback dan bukti sanitasi per ID. Fixtures besar memerlukan runner lokal rollback/cleanup yang dimiliki run; jangan mengubah baris operasional untuk mencapai jumlah yang diminta.
