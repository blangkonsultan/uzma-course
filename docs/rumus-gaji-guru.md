# Rumus Penggajian Guru — Kartu Mengajar AHE Sumokembangsri & Junwangi

Dokumen ini merupakan spesifikasi aturan bisnis (*business requirements spec*) dan formula perhitungan penggajian guru berdasarkan analisis data historis kartu mengajar fisik/Excel (cabang Sumokembangsri & Junwangi). Dokumen ini menjadi acuan implementasi modul presensi, kartu mengajar digital, dan modul payroll ERP.

---

## §1 Konsep Dasar: Tarif vs SPP

1. **Tarif Guru (Fee per Sesi)**:
   - Ditetapkan per **program belajar**.
   - Bersifat **variabel** dan dapat diubah sewaktu-waktu oleh admin.
   - Merupakan hak honor mengajar guru untuk setiap sesi yang dihadiri oleh murid.

2. **SPP Murid**:
   - Ditetapkan per **murid** secara individual.
   - Merupakan kewajiban biaya pendidikan bulanan dari orang tua murid kepada lembaga.
   - Nominal SPP dapat berbeda antar murid meskipun mengambil program belajar yang sama.

3. **Aturan Snapshot (Immutability)**:
   - Saat sesi mengajar dicatat pada kartu mengajar, nilai tarif fee program saat itu langsung di-**snapshot** ke dalam baris transaksi kehadiran.
   - Perubahan master tarif program di masa mendatang **hanya berlaku** untuk sesi yang dicatat setelah tanggal efektif baru, dan **tidak boleh mengubah** data nominal transaksi sesi masa lalu.
   - Prinsip snapshot yang sama berlaku pada SPP ketika invoice/tagihan bulanan murid diterbitkan.

---

## §2 Tarif Fee Guru per Program

Nilai fee dicatat dalam satuan ribuan Rupiah (nilai nominal = angka × Rp 1.000). Semua tarif bersifat variabel sesuai konfigurasi admin:

| Kode Program | Program (Sistem) | Fee Guru / Sesi (Ribu Rp) | Catatan |
|---|---|:---:|---|
| **AHE** | Les Baca Tulis / Anak Hebat (1 guru max 2 murid) | 3 | Variabel |
| **ASE** | `nama lengkap belum dikonfirmasi` (1 guru max 2 murid) | 3 | Variabel |
| **BEE** | Brainy English Education (1 guru max 2 murid) | 7.5 | Variabel — data Fida: 3, 4, 5, 7.5 |
| **MAPEL** | Les Mata Pelajaran SD (Private 1 guru 1 murid) | 5 | Variabel — data Fida: 3, 5, 7.5, 8.5 |
| **HITUNG** | Les Hitung Dasar (1 guru max 4 murid) | 3 | Variabel — belum ada data di kartu Fida |

### Riwayat Perubahan Tarif Master
Untuk mendukung audit dan aturan snapshot, setiap perubahan tarif fee program wajib mencatat:
- `program_id`: ID referensi program.
- `fee_amount`: Besaran fee per sesi.
- `effective_from`: Tanggal mulai berlakunya tarif.
- `created_at`: Waktu pencatatan perubahan.

**Tarif Aktif**: Baris tarif terbaru per program di mana `effective_from <= tanggal_sesi`.

---

## §3 Aturan Kehadiran Murid

1. **Status Hadir**: Fee guru dihitung penuh sesuai tarif program yang berlaku.
2. **Status Tidak Hadir**: Fee guru bernilai 0 (tidak dihitung).
3. **Kasus Khusus (Cancel Mendadak)**: Pembatalan mendadak oleh murid pada jam sesi dapat diberikan kompensasi fee parsial berdasarkan kebijakan cabang (contoh data riil: Rp 2.000 / 2 ribu).

---

## §4 Struktur Kartu Mengajar

Secara fisik dan format kartu mengajar:
- Setiap bulan operasional terdiri dari beberapa **tabel** (kelompok hari mengajar, standar cetak 4 tabel per halaman).
- Tiap tabel memuat **30 slot sesi mengajar**.
- Kolom tabel terdiri dari:
  1. `No`
  2. `Tanggal`
  3. `Nama Murid`
  4. `Status` (Hadir / Tidak Hadir / Keterangan)
  5. `Program (KET)`
  6. `Fee` (Nominal honor sesi)
- Setiap tabel memiliki baris subtotal fee.
- Bulan aktif rata-rata mencakup ~11 tabel sesi per guru.

---

## §5 Formula Gaji Bulanan

Perhitungan total take-home pay guru dalam satu bulan:

```
TOTAL GAJI = FEE_SESI + KEHADIRAN + TRANSPORT + KREATIVITAS + PENDIDIKAN
             [+ FEE_PEMATERI] [+ KURANG_GAJI_PAGI]
```

Keterangan:
- Komponen dalam tanda kurung siku `[...]` bersifat kondisional.

---

## §6 Komponen Gaji

Semua tunjangan disimpan sebagai konfigurasi setting per individu guru (bukan nilai hardcode global), sehingga admin dapat memperbarui nominal tunjangan sewaktu-waktu:

| Komponen | Keterangan | Contoh Data Fida (Ribu Rp) |
|---|---|:---:|
| **Fee Sesi** | Akumulasi `SUM(tarif_program × sesi_hadir)` | Dihitung otomatis |
| **Kehadiran** | Tunjangan kehadiran mengajar bulanan | 80 (Agustus), 20 (September, ijin wisuda) |
| **Transport** | Tunjangan transport bulanan | 60 |
| **Kreativitas** | Tunjangan kreativitas bulanan | 50 |
| **Pendidikan** | Tunjangan kualifikasi jenjang pendidikan guru | 100 (Fida S2) |
| **Fee Pemateri** | Honor tambahan jika ditugaskan sebagai pemateri pelatihan | 50 (September), 0 (Agustus) |
| **Kurang Gaji Pagi** | Top-up penyesuaian jika total pendapatan sesi pagi < batas minimum | 21 (Agustus), 0 (September) |
| **Gaji Minimum Pagi** | Batas ambang bawah garansi pendapatan sesi pagi | 250 |

---

## §7 Aturan Gaji Minimal Pagi

Untuk menjamin kelayakan pendapatan guru yang ditugaskan pada sesi pagi:
1. `Gaji Pagi = fee_sesi_pagi + kehadiran_pagi + transport_pagi`.
2. Ambang batas bawah minimum sesi pagi bersifat variabel (default: 250 ribu / Rp 250.000).
3. **Logika Perhitungan**:
   - Jika `Gaji Pagi < Batas Minimum Pagi`, maka selisih kekurangannya dihitung sebagai:
     `Kurang Gaji Pagi = Batas Minimum Pagi - Gaji Pagi`
   - Nilai `Kurang Gaji Pagi` ditambahkan langsung ke total gaji bulanan.
   - Jika `Gaji Pagi >= Batas Minimum Pagi`, maka `Kurang Gaji Pagi = 0`.

---

## §8 Contoh Perhitungan: Guru Fida (S2), Agustus 2025

### Rincian Sesi Pagi
- Tabel 1: 21 ribu
- Tabel 2: 86 ribu
- Tabel 3: 52 ribu
- **Subtotal Fee Sesi Pagi**: 159 ribu
- Alokasi Transport Pagi: 40 ribu
- Alokasi Kehadiran Pagi: 30 ribu
- **Total Pendapatan Pagi**: 159 + 40 + 30 = 229 ribu
- **Kekurangan terhadap batas 250 ribu**: `250 - 229 = 21 ribu` (ditambahkan sebagai Kurang Gaji Pagi)

### Rincian Total Penggajian
- Fee Sesi (seluruh tabel): 1.036,5 ribu
- Tunjangan Kehadiran: 80 ribu
- Tunjangan Transport: 60 ribu
- Tunjangan Kreativitas: 50 ribu
- Tunjangan Pendidikan: 100 ribu
- Kurang Gaji Pagi: 21 ribu
- **TOTAL GAJI AGUSTUS 2025**:
  `1.036,5 + 80 + 60 + 50 + 100 + 21` = **1.347,5** (Rp 1.347.500)

---

## §9 Contoh Perhitungan: Guru Fida (S2), September 2025

### Rincian Sesi Pagi
- Subtotal Fee Sesi Pagi: 267 ribu
- Alokasi Kehadiran Pagi: 20 ribu
- Alokasi Transport Pagi: 30 ribu
- **Total Pendapatan Pagi**: `267 + 20 + 30 = 317 ribu`
- Karena 317 >= 250 ribu (melebihi batas minimum), maka `Kurang Gaji Pagi = 0`.

### Rincian Total Penggajian
- Fee Sesi (seluruh tabel): 1.102 ribu
- Tunjangan Kehadiran: 20 ribu (ada potongan ijin wisuda)
- Tunjangan Transport: 60 ribu
- Tunjangan Kreativitas: 50 ribu
- Tunjangan Pendidikan: 100 ribu
- Fee Pemateri: 50 ribu
- Kurang Gaji Pagi: 0
- **TOTAL GAJI SEPTEMBER 2025**:
  `1.102 + 20 + 60 + 50 + 100 + 50` = **1.382** (Rp 1.382.000)

---

## §10 Rencana Presensi Guru Digital (Session-Based)

Presensi dan keterlambatan guru diukur secara **session-based** (berdasarkan shift sesi mengajar), bukan akumulasi harian:

1. **Struktur Sesi (Shift)**:
   - Sesi merupakan blok waktu per hari per cabang operasional.
   - Contoh shift:
     - `PAGI`: 09:00 – 12:30 WIB
     - `SORE`: 15:30 – 19:30 WIB
   - Jadwal sesi bersifat variabel per hari sesuai pengaturan admin (`branch_id`, `day_of_week`, `shift`, `start_time`, `end_time`).

2. **Penugasan & Toleransi Waktu**:
   - Guru dapat ditugaskan penuh (*full session*) atau parsial (*partial session*).
   - Patokan keterlambatan dihitung dari **jadwal slot pertama penugasan guru**, bukan jam pembuka sesi cabang.
   - *Contoh*:
     - Guru A dijadwalkan full sesi PAGI (slot awal 09:00) → batas check-in sebelum 09:00 WIB.
     - Guru B dijadwalkan mengajar mulai slot 10:30 WIB → batas check-in sebelum 10:30 WIB.

3. **Status Presensi per Sesi**:
   - `tepat_waktu`: Check-in sebelum waktu mulai slot penugasan.
   - `terlambat`: Check-in melewati waktu mulai (mencatat durasi keterlambatan dalam menit).
   - `ijin`: Permohonan ijin terkonfirmasi admin.
   - `tidak_hadir`: Tidak ada pencatatan kehadiran tanpa konfirmasi.

4. **Metode Check-in Presensi**:
   - **Metode 1 (QR Code)**: Scan QR code dinamis/statis di lokasi cabang fisik.
   - **Metode 2 (Geofencing GPS)**: Tap tombol "Hadir" melalui perangkat guru dengan validasi GPS (radius maksimal 100 meter dari titik koordinat cabang).

5. **Koordinat Geofencing Cabang**:
   - **Cabang Balongbendo (Ahe Sumokembangsri)**: Latitude `-7.4320527`, Longitude `112.5054893`
   - **Cabang Krian (Ahe Junwangi)**: Latitude `-7.4062116`, Longitude `112.6081986`

6. **Struktur Data Log Presensi**:
   - `guru_id`, `branch_id`, `shift`, `tanggal`, `timestamp`, `metode`, `gps_lat`, `gps_lng`, `jarak_meter`, `status`, `durasi_terlambat_menit`.

7. **Integrasi ke Formula Payroll**:
   - **Kehadiran**: Menentukan pencairan tunjangan kehadiran (penuh atau dipotong proporsional sesuai rasio kehadiran/ijin).
   - **Transport**: Dihitung proporsional berdasarkan jumlah shift/sesi kehadiran fisik di cabang.
   - **Keterlambatan**: Data agregat menit keterlambatan sebagai metrik evaluasi kinerja oleh admin.

---

## §11 Tahapan Implementasi ERP (Roadmap)

| Tahap | Modul / Fitur | Fokus Implementasi | Status |
|---|---|---|:---:|
| **2a** | Auth & Data Master | Login, autentikasi sesi, CRUD master guru, CRUD master murid | ✅ Selesai |
| **2b-1** | Jadwal Sesi & Presensi Guru | Setting sesi per cabang & hari, assignment jadwal guru, check-in QR & geofencing GPS, dashboard log presensi | Terencana |
| **2b-2** | Kartu Mengajar Digital | Pencatatan sesi murid (Hadir/Tidak), snapshot tarif fee per transaksi, rekapitulasi fee per tabel & bulan | Terencana |
| **2b-3** | Penggajian & SPP | Otomatisasi formula gaji guru (fee sesi + tunjangan + kurang pagi), riwayat perubahan tarif master, invoice & tagihan SPP murid | Terencana |
| **2b-4** | Laporan & Rekap | Laporan rekap gaji bulanan, laporan presensi guru, monitoring SPP murid, export PDF/Excel | Terencana |
