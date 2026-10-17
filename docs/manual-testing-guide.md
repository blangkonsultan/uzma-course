# Panduan Manual Testing (QA Test Cases & Scenarios)

Dokumen ini memuat panduan pengujian manual komprehensif untuk sistem **Uzma Course**, mencakup alur positif (*happy path*), skenario negatif (*negative testing*), batas sistem (*boundary testing*), pengujian keamanan (*security & authorization*), serta pengujian aksesibilitas dan responsivitas seluler.

---

## 0. Prasyarat & Lingkungan Pengujian

### 0.1 Akun Uji Standar
| Peran (Role) | Email | Password | URL Akses | Deskripsi Akses |
|---|---|---|---|---|
| **Admin** | `admin@uzmacourse.com` | `admin123456` | `http://localhost:3000/login` | Akses penuh portal Admin (Master Data, CMS, Payroll, Penjadwalan) |
| **Guru (Contoh)** | `guru.fida@uzmacourse.com` | `guru123456` | `http://localhost:3000/login` | Akses portal Guru (Jadwal, Kartu Mengajar, Honor, Presensi PWA) |

### 0.2 Persiapan Data Awal
1. Server pengujian aktif: jalankan `./init.sh` lalu `npm run dev` pada port `3000`.
2. Database memiliki minimal 1 cabang aktif (misal: *Sumokembangsri*), 1 shift kerja aktif, dan minimal 1 draf jadwal yang memiliki penugasan kelas guru dan murid.

---

## MODUL 1: Kartu Kendali Mengajar (Teaching Log)
- **Target URL**: Guru `/guru/jadwal` $\rightarrow$ `/guru/mengajar/[classId]`
- **Tujuan**: Memastikan pencatatan sesi mengajar per murid, penyimpanan draf, penguncian sesi, dan pencegahan manipulasi data berjalan sesuai aturan bisnis.

### 1.1 Skenario Positif (Happy Path)
| ID Skenario | Judul Uji | Langkah Pengujian | Data Input | Hasil yang Diharapkan |
|---|---|---|---|---|
| **TC-LOG-01** | Simpan Draf Kartu Mengajar | 1. Login sebagai Guru.<br>2. Buka menu **Jadwal** (`/guru/jadwal`).<br>3. Klik tautan **"Isi Kartu Mengajar"** pada kartu kelas aktif.<br>4. Pilih status presensi murid = "Hadir", isi capaian belajar & catatan guru.<br>5. Klik tombol **"Simpan Draf"**. | Status: `present`<br>Capaian: *"Membaca modul 2 hal 5"*, Catatan: *"Fokus belajar sangat baik"* | Muncul notifikasi toast hijau *"Draf berhasil disimpan"*. Data tersimpan ke database, form tetap dapat diedit (status tetap draf). |
| **TC-LOG-02** | Submit Langsung dengan Perubahan In-Memory | 1. Buka kartu mengajar berstatus draf.<br>2. Ubah catatan murid langsung di form tanpa klik simpan draf terlebih dahulu.<br>3. Langsung klik tombol **"Kirim Kartu"** dan konfirmasi pada dialog. | Catatan murid baru | Sistem secara atomik menyimpan perubahan data terkini terlebih dahulu, lalu mengeksekusi submit. Sesi berubah status menjadi `submitted` dan form terkunci menjadi *read-only*. |
| **TC-LOG-03** | Pembacaan Arsip Sesi yang Sudah Dikirim (*Submitted Locking*) | 1. Buka kembali sesi mengajar yang telah disubmit melalui riwayat jadwal. | - | Halaman menampilkan status **"Terkunci (Submitted)"**, seluruh field input berstatus disabled/read-only, fee snapshot terkunci, dan tombol simpan/kirim disembunyikan. |
| **TC-LOG-04** | Pemilihan Tanggal Historis Sesuai Hari Kelas | 1. Buka form mengajar kelas yang terdaftar pada hari Jumat.<br>2. Klik pemilih tanggal sesi.<br>3. Pilih tanggal Jumat pada 1 atau 2 minggu sebelumnya. | Tanggal Jumat historis | Form berhasil memuat riwayat draf/sesi untuk tanggal historis tersebut tanpa error validasi hari. |

### 1.2 Skenario Negatif & Batas Sistem (Negative Testing)
| ID Skenario | Judul Uji | Langkah Pengujian | Data Input | Hasil yang Diharapkan |
|---|---|---|---|---|
| **TC-LOG-NEG-01** | Pengisian Tanggal Masa Depan (*Future Date*) | 1. Buka form mengajar.<br>2. Pada input tanggal sesi, coba pilih tanggal besok atau minggu depan (via keyboard atau URL param `?date=YYYY-MM-DD`).<br>3. Klik Simpan Draf / Kirim Kartu. | Tanggal $T+1$ hari | Input date picker dibatasi secara visual dengan `max={todayWib}`. Bila dipaksa lewat URL/request, Server Action menolak dengan pesan error: *"Tanggal sesi tidak boleh melebihi hari ini"*. |
| **TC-LOG-NEG-02** | Pengisian Tanggal di Luar Hari Kelas (*Weekday Mismatch*) | 1. Kelas terdaftar pada hari **Jumat**.<br>2. Ubah URL parameter secara manual menjadi hari **Senin**: `/guru/mengajar/[id]?date=2026-10-12`. | Hari di luar jadwal kelas | Sistem mendeteksi ketidaksesuaian hari dan melakukan *fallback* otomatis ke hari operasional kelas terdekat yang valid tanpa mengalami *crash*. |
| **TC-LOG-NEG-03** | Akses Form Kelas Milik Guru Lain (*Unauthorized IDOR*) | 1. Login sebagai Guru A.<br>2. Buka URL kartu mengajar yang ditugaskan kepada Guru B: `/guru/mengajar/[classIdGuruB]`. | Class ID milik guru lain | Sistem menolak dengan halaman `404 Not Found` atau pesan penolakan akses: *"Anda tidak memiliki akses ke kelas ini"*. |
| **TC-LOG-NEG-04** | Pengiriman Form Tanpa Memilih Presensi Murid | 1. Buka kartu mengajar baru.<br>2. Biarkan status kehadiran murid kosong (belum dipilih Hadir/Tidak Hadir/Izin).<br>3. Coba klik tombol **"Kirim Kartu"**. | Kehadiran murid belum dipilih | Tombol submit ter-disable atau sistem menampilkan peringatan: *"Harap lengkapi status kehadiran seluruh murid sebelum mengirim"*. |
| **TC-LOG-NEG-05** | Percobaan Mutasi pada Sesi yang Telah Dikirim | 1. Buka sesi yang sudah berstatus `submitted`.<br>2. Melalui console developer browser, kirim request RPC `save_teaching_session` atau `submit_teaching_session` menggunakan ID sesi yang sama. | Payload manipulasi sesi `submitted` | Database menolak eksekusi dengan exception PostgreSQL: *"Sesi telah berstatus submitted dan terkunci"*. |

---

## MODUL 2: Penggajian Guru (Payroll Guru Ledger)
- **Target URL**: Admin `/admin/payroll` · Guru `/guru/honor`
- **Tujuan**: Memastikan perhitungan fee sesi mengajar, tunjangan tetap, penyesuaian manual (*adjustments*), dan siklus status penggajian berjalan atomik tanpa drift.

### 2.1 Skenario Positif (Happy Path)
| ID Skenario | Judul Uji | Langkah Pengujian | Data Input | Hasil yang Diharapkan |
|---|---|---|---|---|
| **TC-PAY-01** | Buka Periode Payroll Baru | 1. Login sebagai Admin.<br>2. Masuk ke menu **Penggajian Guru** (`/admin/payroll`).<br>3. Klik tombol **"+ Bulan Baru"**.<br>4. Pilih bulan berikutnya (misal: `2026-11`) dan klik "Buka Periode". | Bulan baru | Periode baru terbuat dengan status `open` (Terbuka), ringkasan KPI menampilkan nilai awal 0 sesi / 0 guru, dan dropdown berpindah ke bulan baru. |
| **TC-PAY-02** | Tutup Periode Payroll (*Close Period Snapshot*) | 1. Pada periode aktif bulan berjalan yang memiliki kartu mengajar tersubmit.<br>2. Klik tombol **"Tutup Periode Payroll"**.<br>3. Klik "Konfirmasi Tutup Periode" pada dialog. | - | Periode berubah menjadi `closed` (Ditutup). Database mengunci sesi tersubmit, membekukan *snapshot* tunjangan tetap dan garansi minimum, serta menampilkan tabel rincian guru secara instan. |
| **TC-PAY-03** | Penambahan Adjustment Positif & Negatif | 1. Pada periode berstatus `closed`, klik **"+ Tambah Adjustment"**.<br>2. Pilih Guru, isi nominal positif `50000` dengan alasan *"Bonus modul"*, lalu klik Simpan.<br>3. Buka form kembali, isi nominal negatif `-15000` dengan alasan *"Potongan keterlambatan"*, lalu Simpan. | Nominal: `50000` & `-15000` | Baris penyesuaian bertambah, total adjustment guru terhitung bersih (`+35000`), dan Grand Total payroll langsung terbarui otomatis. |
| **TC-PAY-04** | Pencairan Honor (*Mark Period Paid*) | 1. Pada periode `closed`, klik **"Tandai Sudah Dibayar"**.<br>2. Amati perubahan antarmuka. | - | Badge berubah menjadi `Sudah Dibayar` (hijau). Seluruh tombol mutasi (Tutup, Adjustment) disembunyikan dan data terkunci permanen. |
| **TC-PAY-05** | Guru Memeriksa Estimasi Honor Berjalan | 1. Login sebagai Guru.<br>2. Buka menu **Honor** (`/guru/honor`).<br>3. Periksa rincian pada kartu utama. | - | Menampilkan badge **"Estimasi Berjalan"**, fee sesi terakumulasi akurat dari sesi yang disubmit bulan ini, rincian tunjangan tetap aktif tampil, dan garansi honor minimum tercantum. |
| **TC-PAY-06** | Guru Memeriksa Slip Resmi Periode Lampau | 1. Pada halaman `/guru/honor`, buka dropdown **"Periode"**.<br>2. Pilih bulan lampau yang berstatus `Sudah Ditransfer`. | Periode lampau | Halaman memuat slip resmi dengan badge hijau *"Sudah Ditransfer / Paid"*, menampilkan data historis snapshot saat periode ditutup. |

### 2.2 Skenario Negatif & Batas Sistem (Negative Testing)
| ID Skenario | Judul Uji | Langkah Pengujian | Data Input | Hasil yang Diharapkan |
|---|---|---|---|---|
| **TC-PAY-NEG-01** | Tambah Adjustment dengan Nominal Nol (0) atau Alasan Kosong | 1. Buka form penyesuaian pada periode `closed`.<br>2. Masukkan nominal `0` atau biarkan alasan kosong/hanya spasi.<br>3. Klik Simpan. | Nominal: `0`, Alasan: `""` | Sistem menolak di sisi client & server dengan pesan: *"Nominal dan alasan adjustment wajib diisi."* Data tidak tersimpan ke database. |
| **TC-PAY-NEG-02** | Tambah Adjustment pada Periode Terbuka (`open`) | 1. Pada periode berstatus `open`, coba panggil Server Action `addAdjustmentAction` secara langsung. | Payload adjustment pada status `open` | Database RPC `add_payroll_adjustment` menolak dengan kode `P0001`: *"Adjustment hanya dapat ditambahkan pada periode yang ditutup"*. |
| **TC-PAY-NEG-03** | Modifikasi Data pada Periode yang Sudah Dibayar (`paid`) | 1. Pada periode berstatus `paid`, coba panggil Server Action penutupan atau penambahan adjustment. | Period ID berstatus `paid` | Server menolak operasi. Mutasi dilarang mutlak setelah honor dicairkan. |
| **TC-PAY-NEG-04** | Duplikasi Pembuatan Periode Bulan yang Sama | 1. Periode `2026-10-01` sudah terdaftar.<br>2. Coba buat periode baru dengan memilih bulan yang sama `2026-10-01`. | Bulan `2026-10-01` | Database menolak karena adanya batasan `UNIQUE (period_month)` dengan pesan: *"Periode payroll untuk bulan ini sudah ada"*. |
| **TC-PAY-NEG-05** | Guru Non-Aktif yang Pernah Mengajar dalam Periode | 1. Guru X mengajar dan men-submit sesi di awal bulan.<br>2. Di pertengahan bulan, Admin menonaktifkan akun Guru X (`is_active = false`).<br>3. Admin menutup periode payroll di akhir bulan. | Guru non-aktif memiliki jam mengajar | Guru X **tetap masuk** ke dalam `payroll_entries` dan berhak menerima pembayaran atas jam mengajar yang telah diselesaikannya. |
| **TC-PAY-NEG-06** | Sesi Mengajar Bulan Depan Tidak Boleh Masuk Bulan Ini | 1. Guru menginput kartu mengajar untuk sesi tanggal bulan berikutnya.<br>2. Buka slip honor bulan ini di `/guru/honor`. | Sesi mengajar bulan $M+1$ | Sesi bulan depan tidak dihitung ke dalam estimasi berjalan bulan ini (terikat aman pada batas `.lt("session_date", nextMonthDate)`). |

---

## MODUL 3: Presensi Guru & PWA Offline
- **Target URL**: Guru `/guru/absen`
- **Tujuan**: Memverifikasi validasi radius lokasi geofence GPS, toleransi jarak cabang, dan integritas pencatatan waktu kehadiran.

### 3.1 Skenario Positif (Happy Path)
| ID Skenario | Judul Uji | Langkah Pengujian | Data Input | Hasil yang Diharapkan |
|---|---|---|---|---|
| **TC-ATT-01** | Presensi Datang dalam Radius Cabang | 1. Login sebagai Guru.<br>2. Masuk ke menu **Presensi** (`/guru/absen`).<br>3. Beri izin akses GPS lokasi perangkat.<br>4. Berada dalam radius toleransi cabang.<br>5. Klik tombol **"Presensi Datang"**. | Posisi GPS valid ($\le$ radius cabang) | Indikator lokasi berwarna hijau *"Dalam radius"*, tombol presensi aktif, kehadiran tercatat dengan jam WIB, dan kartu shift berubah menjadi aktif. |
| **TC-ATT-02** | Deteksi Otomatis Cabang Penugasan Terdekat | 1. Akun Guru ditugaskan di 2 cabang (*Sumokembangsri* dan *Junwangi*).<br>2. Pengguna berada di lokasi Junwangi.<br>3. Buka halaman `/guru/absen`. | Koordinat GPS lokasi Junwangi | Dropdown lokasi otomatis berpindah ke Cabang Junwangi dengan badge *"Terdekat (Auto)"*. |

### 3.2 Skenario Negatif & Batas Sistem (Negative Testing)
| ID Skenario | Judul Uji | Langkah Pengujian | Data Input | Hasil yang Diharapkan |
|---|---|---|---|---|
| **TC-ATT-NEG-01** | Presensi di Luar Radius Cabang (*Out of Geofence*) | 1. Buka halaman presensi saat berada di luar radius cabang (misal: jarak 200 meter dari titik koordinat cabang). | Jarak 200m (toleransi 50m) | Muncul peringatan merah *"Di luar radius presensi (+150m)"*, tombol presensi terkunci (*disabled*). |
| **TC-ATT-NEG-02** | Pengguna Menolak Izin Lokasi (*Geolocation Denied*) | 1. Buka browser dalam mode Incognito / Private.<br>2. Saat muncul dialog izin lokasi, pilih **Blokir / Deny**. | Izin GPS ditolak | Tampil pesan peringatan ramah: *"Akses GPS ditolak. Mohon aktifkan izin lokasi di browser Anda untuk melakukan absensi"*. Halaman tidak mengalami *crash*. |
| **TC-ATT-NEG-03** | Percobaan Presensi Datang Ganda pada Shift Sama | 1. Guru telah sukses melakukan presensi datang pada Shift Pagi.<br>2. Muat ulang halaman atau coba kirim request presensi datang kembali. | Shift yang sudah berstatus hadir | Tombol "Presensi Datang" dinonaktifkan atau digantikan dengan opsi "Presensi Pulang". Server menolak duplikasi presensi datang pada shift dan hari yang sama. |

---

## MODUL 4: Papan Penjadwalan (Kanban Board Invariants)
- **Target URL**: Admin `/admin/draft/[id]/board`
- **Tujuan**: Memastikan alokasi jadwal kelas, pencegahan bentrok multi-cabang, dan kuota frekuensi murid divalidasi secara konsisten.

### 4.1 Skenario Positif (Happy Path)
| ID Skenario | Judul Uji | Langkah Pengujian | Data Input | Hasil yang Diharapkan |
|---|---|---|---|---|
| **TC-BRD-01** | Penempatan Guru & Murid ke Papan Jadwal | 1. Buka papan jadwal draf aktif.<br>2. Buka modal **"Tambah Kelas"**.<br>3. Pilih Guru dan Varian Program Belajar.<br>4. Tambahkan murid yang memiliki sisa kuota frekuensi mingguan. | Guru A, Program AHE, Murid X | Kartu kelas berhasil dipasang pada kolom shift. Kuota frekuensi murid terpakai berkurang 1. |
| **TC-BRD-02** | Aksesibilitas Keyboard Modal Penjadwalan | 1. Klik tombol "Tambah Kelas".<br>2. Tekan tombol `Tab` berulang-ulang.<br>3. Tekan tombol `Escape`. | Tombol keyboard `Tab`, `Escape` | Fokus keyboard terperangkap di dalam modal (*focus containment*). Menekan tombol `Escape` langsung menutup modal. |

### 4.2 Skenario Negatif & Invariant Integritas (Negative Testing)
| ID Skenario | Judul Uji | Langkah Pengujian | Data Input | Hasil yang Diharapkan |
|---|---|---|---|---|
| **TC-BRD-NEG-01** | Bentrok Jadwal Guru Lintas Cabang di Jam Sama | 1. Guru A dijadwalkan di Cabang 1 pada hari Jumat pukul 09:00 - 10:00.<br>2. Pada Cabang 2, Admin mencoba menjadwalkan Guru A pada hari Jumat pukul 09:30 - 10:30. | Jam mengajar yang beririsan (*overlap*) | Sistem menolak penempatan dengan pesan: *"Guru [Nama] telah memiliki jadwal mengajar di Cabang [X] pada jam yang beririsan"*. |
| **TC-BRD-NEG-02** | Alokasi Murid Melebihi Kuota Frekuensi Mingguan | 1. Murid mengambil paket belajar 2x seminggu (`frequency = 2`).<br>2. Murid telah ditempatkan di 2 kelas dalam draf aktif.<br>3. Coba tempatkan murid ke kelas ke-3. | Penempatan kelas ke-3 | Sistem menolak penempatan dengan pesan error bahwa kuota mingguan murid telah terpenuhi. |
| **TC-BRD-NEG-03** | Penambahan Murid Melebihi Kapasitas Kelas | 1. Kelas privat memiliki kapasitas maksimal 1 murid (`capacity = 1`).<br>2. Coba tambahkan murid kedua ke dalam kelas tersebut. | Kelas sudah penuh (`1/1`) | Tombol "Tambah Murid" dinonaktifkan atau modal menampilkan pesan *"Kapasitas kelas telah penuh"*. |
| **TC-BRD-NEG-04** | Jam Sesi di Luar Batas Jam Kerja Shift | 1. Shift Pagi beroperasi pukul 08:00 - 11:00.<br>2. Coba buat kelas dengan jam mulai 10:30 dan durasi 60 menit (selesai 11:30). | Sesi melebihi jam tutup shift | Sistem menolak pembuatan kelas karena jam selesai kelas melampaui batas akhir shift. |

---

## MODUL 5: Keamanan & Otorisasi Rute (Security & RLS)
- **Target**: Seluruh endpoint dan rute internal

| ID Skenario | Peran Penguji | URL yang Dituju | Hasil yang Diharapkan | Status Lulus |
|---|---|---|---|---|
| **TC-SEC-01** | Guru | `/admin/payroll` | Dialihkan (*redirect*) ke `/login` atau `/guru` dengan pesan penolakan hak akses. | **PASS** jika admin dashboard tidak bocor. |
| **TC-SEC-02** | Guru | `/admin/guru` | Dialihkan (*redirect*) dan tidak dapat mengakses master data guru. | **PASS** jika daftar profil guru tidak tampil. |
| **TC-SEC-03** | Admin | `/guru/honor` | Dialihkan (*redirect*) ke `/admin` (isolasi peran ketat). | **PASS** jika tidak tertukar dengan portal guru. |
| **TC-SEC-04** | Tamu (Guest) | `/admin` atau `/guru` | Dialihkan (*redirect*) langsung ke `/login` dengan target sanitasi URL aman. | **PASS** jika tidak ada data internal yang terbuka. |
| **TC-SEC-05** | Semua | Input Pencarian (Search Bar) | Masukkan karakter SQL injection: `' OR '1'='1` atau `'; DROP TABLE profiles; --`. Sistem menampilkan "Data tidak ditemukan" tanpa error database. | **PASS** jika parameterized query aman. |

---

## MODUL 6: Pengujian Responsif & Aksesibilitas (Responsive & A11y)
- **Target**: Viewport ponsel (360px, 375px) hingga desktop (1280px+)

| ID Skenario | Parameter Uji | Metode & Target Layar | Kriteria Lulus (Pass Criteria) |
|---|---|---|---|
| **TC-A11Y-01** | Layar Super Kecil (360px) | Buka DevTools mode responsif `360 x 640px` pada halaman `/admin/payroll`, `/guru/honor`, dan `/guru/mengajar/[id]`. | **0 horizontal scroll/overflow**. Teks tidak terpotong, badge status melipat rapi ke baris berikutnya. |
| **TC-A11Y-02** | Pencegahan Auto-Zoom iOS (375px) | Buka DevTools mode responsif `375 x 667px`. Ketuk seluruh field input pada form kartu mengajar dan form penyesuaian. | Seluruh input form menggunakan ukuran font minimal 16px (`text-base sm:text-sm`) sehingga **tidak memicu auto-zoom browser Safari iOS**. |
| **TC-A11Y-03** | Area Sentuh Tombol (*Touch Target* $\ge$ 44px) | Periksa tombol hapus kelas di Kanban, tombol clear search, tombol tutup modal, dan tombol aksi kartu mobile. | Seluruh tombol interaktif memiliki bounding box minimal **44×44px** (mudah ditekan jari tanpa salah klik). |
| **TC-A11Y-04** | Sensitivitas Gerak (*Reduced Motion*) | Aktifkan preferensi OS: *Settings $\rightarrow$ Accessibility $\rightarrow$ Reduce Motion*. Buka aplikasi dan klik modal / tombol simpan. | Animasi zoom/translate yang memusingkan dimatikan, namun indikator loading spinner tetap berputar lembut memberikan tanda proses. |
| **TC-A11Y-05** | Kontras Teks WCAG AA ($\ge$ 4.5:1) | Periksa teks keterangan abu-abu di atas latar putih pada data table, login form, dan tabel honor. | Seluruh teks terbaca menggunakan `text-slate-500` atau lebih gelap (rasio kontras $\ge$ 4.6:1, lulus uji WCAG AA). |

---

## Format Lembar Pelaporan Bug (Bug Report Template)
Bila dalam pengujian manual ditemukan kegagalan atau ketidaksesuaian, gunakan format laporan berikut:

```markdown
### [BUG] Judul Masalah yang Singkat dan Jelas
- **ID Skenario**: [Contoh: TC-LOG-NEG-01]
- **Modul**: [Teaching Log / Payroll / Attendance / Kanban / A11y]
- **Tingkat Keparahan**: [P0 Blocking / P1 Major / P2 Minor / P3 Polish]
- **Lingkungan Uji**: [Contoh: Chrome 128 Desktop / Safari iOS 18 (375px)]
- **Langkah-langkah Reproduksi**:
  1. Login sebagai...
  2. Buka menu...
  3. Lakukan aksi...
- **Hasil Aktual**: [Apa yang terjadi di layar / console error]
- **Hasil yang Diharapkan**: [Apa yang seharusnya terjadi sesuai dokumen panduan]
- **Tangkapan Layar / Log**: [Lampirkan screenshot atau potongan log error]
```
