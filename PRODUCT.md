# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (Turbopack) · React 19 · Vitest · Supabase (Auth + Postgres) · Tailwind CSS v4 · TypeScript · Vercel

## Users

- **Admin (Owner):** Mengelola operasional pusat, menyusun jadwal kelas, mengatur data master, dan mengawasi keuangan.
- **Guru:** Mengakses jadwal harian dan melakukan absensi secara *real-time* (fokus penggunaan via perangkat seluler).
- **Calon Customer:** Publik yang mengunjungi *Landing Page* untuk mencari informasi bimbingan belajar dan mendaftar.
- **Orang Tua Murid (Mendatang):** Menerima pengingat pembayaran SPP dan berpotensi memantau perkembangan anak.

## Product Purpose

Platform manajemen terpadu (ERP) dan etalase digital (*Landing Page*) untuk pusat bimbingan belajar Uzma Course. Produk ini bertujuan mendigitalisasi operasional dari ujung ke ujung: mulai dari pendaftaran murid baru, penjadwalan kelas bebas bentrok, hingga otomasi manajemen SDM (kehadiran dan penggajian guru) dan penagihan finansial (SPP).

## Positioning

Sistem terintegrasi yang menjembatani operasional internal yang kompleks (penjadwalan visual, PWA absensi guru) dengan wajah pemasaran publik (*landing page* dinamis) dalam satu basis data terpusat, mengeliminasi kebutuhan penggunaan aplikasi terpisah.

## Operating Context

- Admin beroperasi terutama melalui antarmuka layar lebar (desktop/tablet) untuk kemudahan mengatur *Kanban Board* jadwal dan melihat rekapitulasi data.
- Guru sangat *mobile* dan beroperasi langsung di lapangan/cabang, sehingga membutuhkan akses instan dan ringan dari genggaman (HP).
- Calon pelanggan mengeksplorasi layanan mayoritas melalui *smartphone* mereka.

## Capabilities and Constraints

- **Modul Guru Wajib PWA:** Halaman dan fitur khusus guru (seperti absensi) **harus** dibangun sebagai *Progressive Web App* (PWA) agar tanggap, andal di jaringan kurang stabil, dan terasa seperti aplikasi *native*.
- **Admin & Landing Page:** Tetap dipertahankan sebagai *Single Page Application* (SPA) / situs web standar tanpa keharusan PWA.
- **Penjadwalan:** Sistem alokasi dinamis untuk guru dan murid ke dalam *shift* waktu tanpa memicu konflik/bentrok jadwal.
- **Keuangan (Mendatang):** Modul kalkulasi otomatis gaji guru (berdasarkan riwayat kehadiran/sesi) dan pengingat tagihan SPP bulanan.

## Brand Commitments

*(Belum ada pedoman merek visual/logo spesifik yang mengikat selain dari UI incumbent, namun terminologi operasional menggunakan Bahasa Indonesia baku, misal: "Papan Jadwal", "Guru", "Murid", "Draf").*

## Evidence on Hand

Telah tersedia *Landing page* publik yang dinamis (dengan CMS) serta modul *Kanban Board* (Papan Jadwal) fungsional untuk Admin. Terdapat basis data *dummy* untuk entitas cabang, guru, murid, dan varian program di dalam *Supabase*.

## Product Principles

1. **Pemilahan Arsitektur Berbasis Peran:** Prioritaskan pengalaman PWA yang ringan untuk Guru di lapangan, dan UI desktop padat informasi (tabel/board) untuk Admin di pusat.
2. **Otomatisasi Meringankan:** Kurangi input manual yang repetitif (cegah bentrok otomatis, hitung gaji otomatis, tagih SPP otomatis).
3. **Kebenaran Data Tunggal (*Single Source of Truth*):** Informasi publik di *Landing Page* (daftar cabang, program) dan data internal terhubung ke satu *database* yang sama tanpa duplikasi.
