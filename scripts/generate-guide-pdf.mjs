import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function toBase64Image(filename) {
  try {
    const filePath = path.resolve("docs/screenshots", filename);
    const buffer = readFileSync(filePath);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error(`Failed to read screenshot: ${filename}`, err.message);
    return "";
  }
}

const shots = {
  login: toBase64Image("01-login.png"),
  dashboard: toBase64Image("02-admin-dashboard.png"),
  murid: toBase64Image("03-admin-murid.png"),
  kanban: toBase64Image("04-admin-kanban.png"),
  payroll: toBase64Image("05-admin-payroll.png"),
  spp: toBase64Image("06-admin-spp.png"),
  receipt: toBase64Image("07-admin-receipt.png"),
  landing: toBase64Image("08-admin-landing.png"),
  guruHome: toBase64Image("09-guru-home.png"),
  guruPresensi: toBase64Image("10-guru-presensi.png"),
  guruJadwal: toBase64Image("11-guru-jadwal.png"),
  guruTeachingLog: toBase64Image("12-guru-teaching-log.png"),
  guruHonor: toBase64Image("13-guru-honor.png"),
};

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Buku Panduan Pengguna — Uzma Course</title>
<style>
  @page {
    size: A4 portrait;
    margin: 18mm 15mm 20mm 15mm;
    @bottom-right {
      content: "Halaman " counter(page);
      font-size: 9pt;
      color: #64748b;
    }
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #334155;
    background-color: #ffffff;
    line-height: 1.55;
    font-size: 10pt;
  }

  h1, h2, h3, h4 {
    color: #1e1b4b;
    font-weight: 700;
  }

  .cover-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px 20px;
    page-break-after: always;
    text-align: center;
  }

  .cover-logo-box {
    margin-top: 40px;
  }

  .cover-badge {
    display: inline-block;
    padding: 6px 16px;
    background-color: #f3e8ff;
    color: #7e22ce;
    font-weight: 700;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    border-radius: 9999px;
    margin-bottom: 24px;
    border: 1px solid #e9d5ff;
  }

  .cover-title {
    font-size: 28pt;
    font-weight: 900;
    line-height: 1.2;
    color: #581c87;
    margin-bottom: 16px;
  }

  .cover-subtitle {
    font-size: 13pt;
    color: #475569;
    max-width: 520px;
    margin: 0 auto;
    line-height: 1.5;
  }

  .cover-meta {
    margin-bottom: 20px;
    font-size: 9.5pt;
    color: #64748b;
    border-top: 2px solid #f1f5f9;
    padding-top: 20px;
  }

  .page-break {
    page-break-before: always;
  }

  .section-header {
    margin-top: 24px;
    margin-bottom: 14px;
    border-bottom: 2px solid #9333ea;
    padding-bottom: 6px;
  }

  .section-title {
    font-size: 16pt;
    color: #581c87;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sub-title {
    font-size: 12pt;
    color: #1e293b;
    margin-top: 16px;
    margin-bottom: 8px;
  }

  p {
    margin-bottom: 10px;
    text-align: justify;
  }

  ul, ol {
    margin-left: 20px;
    margin-bottom: 12px;
  }

  li {
    margin-bottom: 4px;
  }

  .callout {
    padding: 12px 16px;
    border-radius: 12px;
    margin: 14px 0;
    font-size: 9pt;
    border-left: 4px solid #9333ea;
    background-color: #faf5ff;
  }

  .callout-title {
    font-weight: 700;
    color: #6b21a8;
    margin-bottom: 4px;
  }

  .table-box {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9pt;
  }

  .table-box th, .table-box td {
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    text-align: left;
  }

  .table-box th {
    background-color: #f8fafc;
    color: #1e293b;
    font-weight: 700;
  }

  .screenshot-frame {
    margin: 16px 0;
    text-align: center;
    page-break-inside: avoid;
  }

  .screenshot-img-desktop {
    width: 100%;
    max-height: 380px;
    object-fit: contain;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
    background-color: #f8fafc;
  }

  .screenshot-img-mobile {
    width: 220px;
    max-height: 440px;
    object-fit: contain;
    border-radius: 14px;
    border: 2px solid #cbd5e1;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
    background-color: #ffffff;
  }

  .screenshot-caption {
    font-size: 8.5pt;
    font-style: italic;
    color: #64748b;
    margin-top: 6px;
  }

  .grid-two-mobile {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 14px 0;
    page-break-inside: avoid;
  }

  .toc-list {
    list-style: none;
    margin-left: 0;
  }

  .toc-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px dotted #cbd5e1;
    font-size: 10pt;
  }

  .toc-item a {
    text-decoration: none;
    color: #334155;
    font-weight: 600;
  }
</style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-logo-box">
      <span class="cover-badge">Buku Panduan Resmi</span>
      <h1 class="cover-title">BUKU PANDUAN PENGGUNA<br>SISTEM ERP & PWA</h1>
      <p class="cover-subtitle">
        Panduan Operasional Terpadu Manajemen Penjadwalan, Kartu Kendali Belajar, Presensi Geofence, Penggajian Guru, dan Penagihan SPP Siklus 28 Hari
      </p>
    </div>

    <div>
      <div style="width: 80px; height: 4px; background-color: #9333ea; margin: 0 auto 30px auto; border-radius: 2px;"></div>
      <p style="font-size: 11pt; font-weight: 600; color: #581c87;">UZMA COURSE INDONESIA</p>
      <p style="font-size: 9.5pt; color: #64748b;">Cabang Sumokembangsri & Cabang Junwangi · Sidoarjo, Jawa Timur</p>
    </div>

    <div class="cover-meta">
      <strong>Edisi:</strong> Oktober 2026 (Versi 1.0) &nbsp;•&nbsp; <strong>Target Pengguna:</strong> Administrator & Tenaga Pendidik (Guru)
    </div>
  </div>

  <!-- DAFTAR ISI -->
  <div class="page-break"></div>
  <div class="section-header">
    <h2 class="section-title">Daftar Isi Panduan</h2>
  </div>
  <ul class="toc-list">
    <li class="toc-item"><span><strong>1. Gambaran Umum Sistem & Hak Akses</strong></span><span>Hal 3</span></li>
    <li class="toc-item"><span><strong>2. Portal Admin — Login & Navigasi Utama</strong></span><span>Hal 3</span></li>
    <li class="toc-item"><span><strong>3. Portal Admin — Pengelolaan Data Master</strong></span><span>Hal 4</span></li>
    <li class="toc-item"><span><strong>4. Portal Admin — Papan Penjadwalan (Kanban Board)</strong></span><span>Hal 5</span></li>
    <li class="toc-item"><span><strong>5. Portal Admin — Modul Penggajian Guru (Payroll)</strong></span><span>Hal 6</span></li>
    <li class="toc-item"><span><strong>6. Portal Admin — Tagihan SPP Murid & Kwitansi Resmi</strong></span><span>Hal 7</span></li>
    <li class="toc-item"><span><strong>7. Portal Admin — Manajemen Konten Website (CMS)</strong></span><span>Hal 8</span></li>
    <li class="toc-item"><span><strong>8. Portal Guru — PWA Mobile & Presensi Geofence</strong></span><span>Hal 9</span></li>
    <li class="toc-item"><span><strong>9. Portal Guru — Jadwal Harian & Kartu Mengajar (Teaching Log)</strong></span><span>Hal 10</span></li>
    <li class="toc-item"><span><strong>10. Portal Guru — Transparansi Slip Honor Bulanan</strong></span><span>Hal 11</span></li>
    <li class="toc-item"><span><strong>11. Tanya Jawab & Pemecahan Masalah (FAQ)</strong></span><span>Hal 12</span></li>
  </ul>

  <!-- BAB 1 & 2 -->
  <div class="section-header" style="margin-top: 30px;">
    <h2 class="section-title">1. Gambaran Umum Sistem & Hak Akses</h2>
  </div>
  <p>
    Aplikasi <strong>Uzma Course</strong> memadukan sistem pemasaran digital (<em>Landing Page Showcase</em>) dengan operasional internal terpadu (<em>Mini ERP</em>). Seluruh modul operasional diikat oleh basis data terpusat Supabase PostgreSQL dengan otorisasi berbasis peran (<em>Role-Based Access Control</em>):
  </p>
  <table class="table-box">
    <tr>
      <th>Peran (Role)</th>
      <th>Perangkat Kerja Utama</th>
      <th>Cakupan Hak Akses</th>
    </tr>
    <tr>
      <td><strong>Administrator</strong></td>
      <td>Desktop / Laptop / Tablet</td>
      <td>Akses penuh ke Data Master, Papan Jadwal Kanban, Penggajian Guru, Tagihan SPP, dan CMS Website.</td>
    </tr>
    <tr>
      <td><strong>Guru / Pendidik</strong></td>
      <td>Smartphone (Aplikasi PWA)</td>
      <td>Presensi Geofence GPS, Jadwal Mengajar Harian, Pengisian Kartu Kendali Mengajar, dan Slip Honor.</td>
    </tr>
  </table>

  <div class="section-header">
    <h2 class="section-title">2. Portal Admin — Login & Navigasi Utama</h2>
  </div>
  <p>
    Akses portal admin dilakukan melalui peramban web pada alamat <code>https://uzmacourse.com/login</code>.
  </p>
  <ol>
    <li>Masukkan alamat email admin resmi (misal: <code>admin@uzmacourse.com</code>) dan kata sandi.</li>
    <li>Klik tombol <strong>"Masuk ke Portal"</strong>. Sistem mengidentifikasi hak akses dan membuka dashboard utama.</li>
    <li>Sidebar sebelah kiri memuat navigasi terpadu yang disusun berdasarkan fungsi operasional.</li>
  </ol>

  <div class="screenshot-frame">
    <img src="${shots.login}" class="screenshot-img-desktop" alt="Halaman Login Portal">
    <div class="screenshot-caption">Gambar 1: Halaman Login Tunggal Portal Admin & Guru</div>
  </div>

  <div class="page-break"></div>

  <div class="screenshot-frame">
    <img src="${shots.dashboard}" class="screenshot-img-desktop" alt="Dashboard Utama Admin">
    <div class="screenshot-caption">Gambar 2: Dashboard Overview Admin dengan Statistik Operasional Real-time</div>
  </div>

  <!-- BAB 3: DATA MASTER -->
  <div class="section-header">
    <h2 class="section-title">3. Portal Admin — Pengelolaan Data Master</h2>
  </div>
  <p>
    Menu Data Master memastikan konsistensi data seluruh cabang bimbingan belajar:
  </p>
  <ul>
    <li><strong>Data Cabang (<code>/admin/cabang</code>):</strong> Mengatur nama cabang, alamat, titik koordinat GPS (Latitude & Longitude), dan radius toleransi presensi (meter).</li>
    <li><strong>Data Shift (<code>/admin/shift</code>):</strong> Mengatur jam operasional shift mengajar (Pagi & Siang). Jam shift menjadi pembatas mutlak bagi kelas di papan jadwal.</li>
    <li><strong>Program Belajar (<code>/admin/program</code>):</strong> Mengatur paket bimbingan (AHE, ASE, BEE, Mapel SD) beserta Varian rasio kelas (privat, reguler), frekuensi pertemuan mingguan, dan default SPP.</li>
    <li><strong>Data Guru (<code>/admin/guru</code>):</strong> Menugaskan cabang utama dan multi-cabang, kontak WhatsApp, tunjangan tetap bulanan (Transport, Kreativitas), dan garansi honor minimum.</li>
    <li><strong>Data Murid (<code>/admin/murid</code>):</strong> Mengelola data siswa, nomor kontak orang tua, dan menerbitkan Nomor Induk Siswa (NIS) 5 digit otomatis (misal: <code>01001</code> untuk Sumokembangsri).</li>
  </ul>

  <div class="screenshot-frame">
    <img src="${shots.murid}" class="screenshot-img-desktop" alt="Data Master Murid">
    <div class="screenshot-caption">Gambar 3: Pengelolaan Data Murid dengan Penomoran NIS 5 Digit Otomatis</div>
  </div>

  <div class="page-break"></div>

  <!-- BAB 4: KANBAN BOARD -->
  <div class="section-header">
    <h2 class="section-title">4. Portal Admin — Papan Penjadwalan (Kanban Board)</h2>
  </div>
  <p>
    Papan jadwal visual (<code>/admin/draft/[id]/board</code>) mengotomatisasi penempatan kelas tanpa konflik jam:
  </p>
  <ol>
    <li><strong>Pembuatan Kelas:</strong> Klik <code>+ Tambah Kelas</code> pada kolom shift yang dituju, pilih Guru dan Varian Program Belajar. Tentukan rentang jam mengajar.</li>
    <li><strong>Alokasi Murid:</strong> Klik <code>+ Tambah Murid</code> pada kartu kelas. Sistem memeriksa ketersediaan kuota frekuensi mingguan murid dan batas kapasitas kelas.</li>
    <li><strong>Proteksi Bentrok Multi-Cabang:</strong> Sistem secara otomatis menolak alokasi apabila guru yang sama telah dijadwalkan mengajar di cabang lain pada jam yang beririsan.</li>
  </ol>

  <div class="screenshot-frame">
    <img src="${shots.kanban}" class="screenshot-img-desktop" alt="Papan Jadwal Kanban">
    <div class="screenshot-caption">Gambar 4: Papan Penjadwalan Kanban Bebas Bentrok Lintas Cabang</div>
  </div>

  <div class="callout">
    <div class="callout-title">Aksesibilitas Keyboard Modal</div>
    Seluruh modal penambahan kelas dan murid di papan jadwal telah dilengkapi perangkap fokus (<em>focus containment</em>) via tombol <code>Tab</code> dan dapat ditutup instan menggunakan tombol <code>Escape</code>.
  </div>

  <div class="page-break"></div>

  <!-- BAB 5: PAYROLL GURU -->
  <div class="section-header">
    <h2 class="section-title">5. Portal Admin — Modul Penggajian Guru (Payroll)</h2>
  </div>
  <p>
    Modul penggajian (<code>/admin/payroll</code>) menerapkan ledger akuntansi 4 tabel untuk memastikan perhitungan honor sesi mengajar dan tunjangan tetap terkunci tanpa selisih:
  </p>
  <ol>
    <li><strong>Periode Terbuka (Open):</strong> Guru bebas mengisi kartu mengajar. Estimasi honor bertambah secara dinamis.</li>
    <li><strong>Tutup Periode (Closed):</strong> Di akhir bulan, Admin menekan tombol <code>Tutup Periode Payroll</code>. Sistem menarik seluruh sesi mengajar tersubmit, mengunci snapshot tunjangan, dan menghitung rekapitulasi.</li>
    <li><strong>Penyesuaian (Adjustment):</strong> Admin dapat menambahkan bonus (+) atau potongan (-) beserta alasan resmi pada periode ditutup.</li>
    <li><strong>Pencairan (Paid):</strong> Menekan tombol <code>Tandai Sudah Dibayar</code> mengunci seluruh mutasi menjadi permanen dan menerbitkan slip resmi guru.</li>
  </ol>

  <div class="screenshot-frame">
    <img src="${shots.payroll}" class="screenshot-img-desktop" alt="Modul Penggajian Guru">
    <div class="screenshot-caption">Gambar 5: Rekapitulasi Penggajian Guru dan Penguncian Periode Otomatis</div>
  </div>

  <div class="page-break"></div>

  <!-- BAB 6: STUDENT BILLING & SPP -->
  <div class="section-header">
    <h2 class="section-title">6. Portal Admin — Tagihan SPP Murid & Kwitansi Resmi</h2>
  </div>
  <p>
    Modul tagihan SPP (<code>/admin/spp</code>) mengadopsi standar akuntansi pemisahan piutang (<em>Invoice</em>) dan kas masuk (<em>Receipt</em>) berbasis <strong>siklus belajar 28 hari</strong>:
  </p>
  <ul>
    <li><strong>Siklus Bergulir 28 Hari:</strong> Jadwal jatuh tempo tagihan dihitung per 28 hari dari tanggal aktif murid (<code>cycle_start_date</code>), bukan tanggal 1 kalender yang kaku.</li>
    <li><strong>Terbitkan Tagihan Siklus:</strong> Tombol <code>+ Terbitkan Tagihan Siklus</code> mengevaluasi murid aktif dan menerbitkan faktur <code>INV-YYMM-NNNN</code> secara otomatis tanpa risiko duplikasi.</li>
    <li><strong>Pencatatan Pembayaran:</strong> Tombol <code>Catat Bayar</code> mencatat kas masuk (Tunai, Transfer BCA/BRI/Mandiri, QRIS) dan otomatis menerbitkan kwitansi resmi berstempel <strong>LUNAS</strong> bernomor <code>RCT-YYMM-NNNN</code>.</li>
    <li><strong>Cetak Kwitansi Digital:</strong> Tampilan kwitansi resmi siap cetak rapi via browser print.</li>
    <li><strong>Pengingat WhatsApp:</strong> Tombol WhatsApp langsung membuka pesan tagihan sopan berformat lengkap ke nomor wali murid.</li>
  </ul>

  <div class="screenshot-frame">
    <img src="${shots.spp}" class="screenshot-img-desktop" alt="Tagihan SPP Murid">
    <div class="screenshot-caption">Gambar 6: Dashboard Tagihan SPP Murid Siklus 28 Hari dengan 4 Kartu KPI</div>
  </div>

  <div class="screenshot-frame">
    <img src="${shots.receipt}" class="screenshot-img-desktop" alt="Kwitansi Resmi Pembayaran SPP">
    <div class="screenshot-caption">Gambar 7: Dokumen Kwitansi Resmi Digital Berstempel LUNAS Siap Cetak</div>
  </div>

  <div class="page-break"></div>

  <!-- BAB 7: CMS LANDING PAGE -->
  <div class="section-header">
    <h2 class="section-title">7. Portal Admin — Manajemen Konten Website (CMS)</h2>
  </div>
  <p>
    Melalui menu <code>/admin/landing</code>, Admin dapat memperbarui 14 seksi website publik <code>https://uzmacourse.com</code> secara instan:
  </p>
  <ul>
    <li>Hero Banner, Katalog Program Belajar, Keunggulan, Fasilitas Cabang, Profil Tim & Founder.</li>
    <li>Galeri Foto Autentik, Testimoni Orang Tua, Video Pembelajaran (YouTube & TikTok Player).</li>
    <li>Lokasi Cabang & Embed Google Maps, FAQ, Call-to-Action Pendaftaran, dan Floating WhatsApp.</li>
  </ul>

  <div class="screenshot-frame">
    <img src="${shots.landing}" class="screenshot-img-desktop" alt="CMS Landing Page">
    <div class="screenshot-caption">Gambar 8: Dasbor Pengelolaan Konten Website Publik (14 Seksi Dinamis)</div>
  </div>

  <div class="page-break"></div>

  <!-- BAB 8: GURU PWA -->
  <div class="section-header">
    <h2 class="section-title">8. Portal Guru — PWA Mobile & Presensi Geofence</h2>
  </div>
  <p>
    Guru beroperasi menggunakan aplikasi web progresif (PWA) di smartphone untuk kemudahan akses di lapangan:
  </p>
  <ol>
    <li><strong>Instalasi PWA:</strong> Buka <code>https://uzmacourse.com/guru</code> di browser HP. Pilih <em>"Tambahkan ke Layar Utama" (Add to Home Screen)</em>. Ikon aplikasi akan muncul di beranda HP.</li>
    <li><strong>Presensi Geofence GPS:</strong> Buka menu <strong>Presensi</strong>. Sistem mencocokkan posisi GPS dengan koordinat cabang. Tombol <code>Presensi Datang</code> aktif saat guru berada di dalam radius toleransi cabang (misal: &le; 50 meter).</li>
    <li><strong>Presensi Pulang:</strong> Di akhir jam mengajar shift, ketuk tombol <code>Presensi Pulang</code> untuk menutup sesi kerja harian.</li>
  </ol>

  <div class="grid-two-mobile">
    <div style="text-align: center;">
      <img src="${shots.guruHome}" class="screenshot-img-mobile" alt="Beranda Guru Mobile">
      <div class="screenshot-caption">Gambar 9: Beranda Guru PWA</div>
    </div>
    <div style="text-align: center;">
      <img src="${shots.guruPresensi}" class="screenshot-img-mobile" alt="Presensi Geofence">
      <div class="screenshot-caption">Gambar 10: Presensi GPS Geofence Cabang</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BAB 9: JADWAL & KARTU MENGAJAR -->
  <div class="section-header">
    <h2 class="section-title">9. Portal Guru — Jadwal & Kartu Kendali Mengajar</h2>
  </div>
  <p>
    Kartu kendali mengajar digital (<em>Teaching Log</em>) menggantikan kartu kendali kertas manual:
  </p>
  <ol>
    <li><strong>Pilih Kelas:</strong> Buka menu <strong>Jadwal</strong>, pilih hari, lalu ketuk tautan <code>Isi Kartu Mengajar</code>.</li>
    <li><strong>Presensi Murid:</strong> Tandai kehadiran ananda (Hadir, Tidak Hadir, Izin).</li>
    <li><strong>Capaian & Evaluasi:</strong> Tuliskan capaian materi (misal: <em>"Membaca Modul 2 Halaman 8"</em>) dan catatan evaluasi fokus belajar.</li>
    <li><strong>Simpan Draf vs Kirim Kartu:</strong>
      <ul>
        <li><code>Simpan Draf</code>: Menyimpan catatan sementara tanpa mengunci form.</li>
        <li><code>Kirim Kartu</code>: Menyelesaikan sesi mengajar, mengunci kartu menjadi read-only, dan membekukan snapshot honor sesi guru.</li>
      </ul>
    </li>
  </ol>

  <div class="grid-two-mobile">
    <div style="text-align: center;">
      <img src="${shots.guruJadwal}" class="screenshot-img-mobile" alt="Jadwal Mengajar">
      <div class="screenshot-caption">Gambar 11: Jadwal Mengajar Harian</div>
    </div>
    <div style="text-align: center;">
      <img src="${shots.guruTeachingLog}" class="screenshot-img-mobile" alt="Kartu Kendali Mengajar">
      <div class="screenshot-caption">Gambar 12: Kartu Kendali Mengajar Murid</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BAB 10: HONOR GURU -->
  <div class="section-header">
    <h2 class="section-title">10. Portal Guru — Transparansi Slip Honor Bulanan</h2>
  </div>
  <p>
    Menu <strong>Honor</strong> (<code>/guru/honor</code>) memberikan transparansi penuh atas pendapatan pendidik:
  </p>
  <ul>
    <li><strong>Estimasi Berjalan:</strong> Menampilkan total penerimaan sementara bulan ini yang terakumulasi otomatis dari setiap sesi mengajar tersubmit.</li>
    <li><strong>Rincian Tunjangan Tetap:</strong> Transparansi komponen tunjangan aktif (Transport, Kreativitas) serta nominal garansi honor minimum yang terdaftar.</li>
    <li><strong>Arsip Slip Lampau:</strong> Dropdown pemilih periode memungkinkan guru melihat arsip resmi slip gaji yang telah dibayarkan oleh Admin di bulan-bulan sebelumnya.</li>
  </ul>

  <div class="screenshot-frame" style="margin-top: 20px;">
    <img src="${shots.guruHonor}" class="screenshot-img-mobile" alt="Slip Honor Guru">
    <div class="screenshot-caption">Gambar 13: Slip Rekapitulasi Honor & Tunjangan Guru PWA</div>
  </div>

  <!-- BAB 11: FAQ -->
  <div class="section-header" style="margin-top: 30px;">
    <h2 class="section-title">11. Tanya Jawab & Pemecahan Masalah (FAQ)</h2>
  </div>
  <div class="callout" style="border-left-color: #059669; background-color: #f0fdf4;">
    <div class="callout-title" style="color: #047857;">Q: Mengapa tombol Presensi Datang terkunci abu-abu?</div>
    Pastikan GPS ponsel aktif dan izin lokasi telah diberikan di browser. Jika indikator menunjukkan "Di luar radius (+120m)", silakan mendekat ke area gedung cabang bimbel.
  </div>
  <div class="callout" style="border-left-color: #0284c7; background-color: #f0f9ff;">
    <div class="callout-title" style="color: #0369a1;">Q: Bagaimana mencetak kwitansi SPP tanpa header/footer URL browser?</div>
    Pada jendela pratinjau cetak (*Print Preview*) browser, buka menu <em>More Settings</em> &rarr; hilangkan centang pada opsi <em>"Headers and footers"</em>, lalu pastikan <em>"Background graphics"</em> tercentang.
  </div>
  <div class="callout" style="border-left-color: #d97706; background-color: #fffbeb;">
    <div class="callout-title" style="color: #b45309;">Q: Apakah draf kartu kendali mengajar aman bila baterai HP habis?</div>
    Ya, selama tombol <em>Simpan Draf</em> telah ditekan, data tersimpan aman di cloud Supabase dan dapat dibuka kembali kapan pun saat perangkat aktif kembali.
  </div>

</body>
</html>
`;

writeFileSync("docs/buku-panduan-pengguna.html", htmlContent, "utf8");
console.log("Successfully generated docs/buku-panduan-pengguna.html");
