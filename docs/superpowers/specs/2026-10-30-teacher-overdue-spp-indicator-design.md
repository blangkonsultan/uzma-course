# Design Document: Indikator & Rincian SPP Jatuh Tempo untuk Guru

**Tanggal:** 2026-10-30  
**Status:** Draf Menunggu Persetujuan  
**Target Modul:** Modul Guru PWA (`/guru/jadwal`, `/guru/mengajar/[id]`)

---

## 1. Intent & The Why

Guru bimbingan belajar berinteraksi langsung secara tatap muka dengan murid dan orang tua saat mengantar/menjemput anak. Saat ini, informasi penagihan SPP hanya dapat diakses oleh Admin di `/admin/spp`. Ketika murid memiliki tunggakan SPP yang telah melewati tanggal jatuh tempo (*overdue*), guru tidak mengetahuinya sehingga kehilangan momentum untuk membantu mengingatkan orang tua secara persuasif dan lisan di lapangan.

Fitur ini bertujuan memberikan visibilitas status tagihan SPP yang telah jatuh tempo kepada guru saat melihat jadwal kelas dan saat membuka kartu mengajar, sehingga guru dapat membantu mengingatkan orang tua murid secara lisan saat bertemu.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals
- Memberikan indikator ringkas (*badge/chip*) pada kartu jadwal kelas di `/guru/jadwal` apabila terdapat minimal satu murid di kelas tersebut yang memiliki tagihan SPP belum lunas dan telah melewati tanggal jatuh tempo (`due_date < hari_ini_wib`).
- Menampilkan rincian tanggal jatuh tempo dan akumulasi total nominal tagihan yang belum dibayar pada baris masing-masing murid saat daftar murid di jadwal dibuka.
- Menampilkan penanda informasi yang sama pada kartu murid di halaman Kartu Mengajar (`/guru/mengajar/[id]`) saat guru mengisi presensi dan capaian murid.
- Menjaga antarmuka ramah (*Friendly Classroom*), jelas, informatif, dan tidak merusak estetika maupun alur presensi guru.

### Non-Goals
- Tidak menyediakan tombol kirim WhatsApp atau tautan penagihan mandiri dari akun guru. Jalur komunikasi resmi WhatsApp tetap terpusat eksklusif di tangan Admin.
- Tidak menyediakan formulir pembayaran, input kwitansi, atau perubahan status tagihan dari portal guru.
- Tidak mengubah skema tabel database (tidak ada DDL migrations).

### Anti-Goals
- **Anti-Goal 1:** Guru menghubungi orang tua secara formal lewat sistem pesan otomatis (dilarang; guru hanya menyampaikan pengingat secara lisan tatap muka).
- **Anti-Goal 2:** Menyebabkan *layout shift* (CLS) atau pemanggilan API berulang (*waterfall*) yang memperlambat PWA guru di jaringan seluler lemah.

---

## 3. Constraints & Design System

- **Mode Operasi:** *Operate* (PWA Guru untuk perangkat seluler).
- **Design System:** Mengikuti `DESIGN.md` (*Friendly Classroom*), warna token Tailwind (Amber/Orange untuk peringatan jatuh tempo dengan kontras teks yang memenuhi standar aksesibilitas WCAG).
- **Perangkat & Responsif:** Kompatibel dengan layar seluler mulai dari 360px hingga layar desktop tanpa *horizontal overflow*.
- **Data Access Layer (DAL):** Wajib mengikuti standar arsitektur `AGENTS.md` (abstraksi query Supabase di dalam `src/lib/`, tidak melakukan raw query langsung di komponen UI).

---

## 4. Approaches Considered

### Opsi A: Agregasi di Data Access Layer (DAL Server-Side Batch Fetch) — **DIPILIH**
- **Deskripsi:** Pada fungsi DAL `getTeacherActiveSchedule` (`src/lib/teacher-schedule.ts`) dan `getTeacherScheduleClassForLog` (`src/lib/teaching-logs.ts`), setelah mengumpulkan daftar murid kelas, lakukan *batch query* ke tabel `student_invoices` dengan filter `student_id IN (...)`, `status = 'unpaid'`, dan `due_date < todayWib`. Data diagregasikan per murid: `due_date` (tanggal jatuh tempo paling awal) dan `total_amount` (penjumlahan seluruh tagihan yang belum lunas).
- **Trade-off:** Sedikit agregasi di memori server Next.js (sangat cepat untuk 5–20 murid per kelas).
- **Alasan Dipilih:** Sesuai arsitektur proyek, bebas risiko migrasi database, dan data langsung tersaji pada saat Server Component dirender tanpa *loading state* tambahan di klien.

### Opsi B: Database View / Stored Procedure (RPC Migration)
- **Deskripsi:** Membuat migrasi SQL baru di Supabase yang membuat *View* atau *RPC function* untuk menggabungkan jadwal kelas, penempatan murid, dan status tagihan di dalam Postgres engine.
- **Trade-off:** Memerlukan migrasi SQL baru (`npx supabase migration new`), menambah pemeliharaan objek database, dan mempersulit unit test lokal karena membutuhkan mock RPC baru.
- **Alasan Ditolak:** Berlebihan (*over-engineering*) untuk kebutuhan relasi data yang sudah tersedia di level DAL.

---

## 5. Architectural & Technical Decisions

### 5.1 Struktur Data (Data Contract)

Pada `src/lib/teacher-schedule.ts`:
```typescript
export interface StudentOverdueSppInfo {
  due_date: string;
  total_amount: number;
  invoice_count: number;
}

export interface TeacherScheduleStudentItem {
  id: string;
  full_name: string;
  student_number: string | null;
  overdue_spp?: StudentOverdueSppInfo | null;
}

export interface TeacherClassItem {
  // ... fields eksisting ...
  students: TeacherScheduleStudentItem[];
  overdue_students_count?: number;
}
```

Pada `src/lib/teaching-logs.ts`:
```typescript
export interface TeacherScheduleStudent {
  id: string;
  full_name: string;
  student_number: string | null;
  overdue_spp?: StudentOverdueSppInfo | null;
}
```

### 5.2 Aturan Bisnis & Query Jatuh Tempo
- Tanggal referensi: Menggunakan batas waktu hari ini zona WIB (`getWIBDateBounds().dateString`).
- Kriteria tagihan jatuh tempo (Khusus Program Kelas):
  - `status = 'unpaid'`
  - `due_date < todayWib`
  - `program_id = classInfo.program_id` (tagihan difilter khusus untuk program kelas yang sedang diajar guru, sehingga guru kelas AHE hanya melihat tunggakan AHE tanpa mencampur tagihan program lain yang diambil murid).
- Agregasi jika murid memiliki lebih dari 1 tagihan jatuh tempo pada program tersebut (misal menunggak 2 atau 3 siklus berturut-turut):
  - `due_date`: ambil tanggal paling lampau (earliest overdue) agar guru tahu sejak kapan tagihan program tersebut menunggak.
  - `total_amount`: jumlahkan seluruh `total_amount` dari invoice jatuh tempo pada program tersebut.
  - `invoice_count`: jumlah lembar tagihan yang menunggak pada program tersebut.
### 5.3 UI / Tampilan & Penyelarasan Kaidah Desain

Sesuai hasil audit desain (Claude Opus 4.6 & Detektor Impeccable), implementasi wajib mengikuti kaidah visual berikut:

1. **Header Kelas di `/guru/jadwal`:**
   - Gunakan *pill badge* (`rounded-full`) dengan token kontras WCAG AA:
     `bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 inline-flex items-center gap-1`
   - Gunakan ikon Lucide `<AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" aria-hidden="true" />` (bukan karakter emoji literal `⚠️`).
   - Label: `{cls.overdue_students_count} Jatuh Tempo`.
   - Pastikan tombol akordeon "Lihat Murid" memiliki tinggi target sentuh minimal 44px (`min-h-11`).

2. **Daftar Murid di `/guru/jadwal`:**
   - Pertahankan border kartu murid standar (`border border-slate-200/80 rounded-xl`) untuk menghindari sinyal visual ganda (*color-alone redundancy*).
   - Di bawah nama murid, sematkan kotak info khusus:
     `bg-amber-50 border border-amber-200 rounded-xl p-2.5 mt-2 flex items-start gap-1.5 text-xs text-amber-800`
   - Memuat:
     - Ikon: `<AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />`
     - Teks: `{st.overdue_spp.invoice_count} tagihan jatuh tempo sejak {formatDateIndo(st.overdue_spp.due_date)} · `
     - Nominal: `<span className="font-bold tabular-nums text-amber-900">Rp {st.overdue_spp.total_amount.toLocaleString("id-ID")}</span>`

3. **Kartu Mengajar di `/guru/mengajar/[id]`:**
   - Pada kartu tiap murid (di bawah nama murid sebelum opsi presensi), jika ada `overdue_spp`:
     - Tampilkan kotak info kompak:
       `bg-amber-50 border border-amber-200 rounded-xl p-2 flex items-center gap-1.5 text-xs text-amber-800`
     - Teks: `SPP jatuh tempo: {formatDateIndo(student.overdue_spp.due_date)} · `
     - Nominal: `<span className="font-bold tabular-nums text-amber-900">Rp {student.overdue_spp.total_amount.toLocaleString("id-ID")}</span>`
   - Murni informatif dan tidak mengunci form presensi.
---

## 6. What's Left to the Builder

- Implementasi helper pemformatan tanggal Indonesia yang konsisten di komponen terkait (atau menggunakan `formatDateIndo`).
- Penyesuaian unit test yang sudah ada:
  - `tests/components/teacher-schedule-client.test.tsx`
  - `tests/components/teaching-log-form.test.tsx`
  - `tests/crud/teaching-log-dal.test.ts`
- Verifikasi regresi dengan menjalankan suite pengujian (`npm test`) dan build produksi (`npm run build`).
