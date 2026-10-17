# Technical Specification: Student Billing & SPP Invoicing (Sub-project 2 of feat-010)

- **Date:** 2026-10-17
- **Status:** Draft for Review (Specification Gate)
- **Parent Feature:** `feat-010` — Phase 2b ERP: Payroll & Student Billing
- **Sub-project:** Student Billing (Tagihan SPP Murid Berbasis Siklus 28 Hari & Kwitansi Resmi)
- **Author:** Assistant & Project Owner (Uzma Course)

---

## 1. Context & Business Rules

Menyusul penyelesaian Sub-project 1 (Payroll Guru), Sub-project 2 melengkapi siklus keuangan ERP Uzma Course dari sisi **pemasukan (Revenue/SPP Murid)**.

### 1.1 Aturan Bisnis & Karakteristik Bimbel Uzma Course
1. **Siklus Belajar Berbasis 28 Hari (Rolling 28-Day Cycle)**:
   - Pendaftaran murid bersifat fleksibel (*rolling enrollment*) sepanjang tahun, tidak terikat pada tanggal 1 awal bulan kalender.
   - Kolom `cycle_start_date` dan `cycle_days` (default: 28 hari) pada tabel `student_programs` menentukan awal dan akhir periode belajar setiap murid per program.
   - Contoh: Murid terdaftar pada `2026-10-05` dengan siklus 28 hari:
     - Siklus 1: `2026-10-05` s/d `2026-11-01`
     - Siklus 2: `2026-11-02` s/d `2026-11-29`
     - Siklus 3: `2026-11-30` s/d `2026-12-27`
2. **Standar Akuntansi Keuangan**:
   - Pemisahan dokumen tagihan piutang usaha (**Invoice / Faktur Tagihan**) dengan bukti kas masuk (**Official Receipt / Kwitansi**).
   - Penomoran faktur tagihan: `INV-YYMM-NNNN` (misal: `INV-2610-0001`).
   - Penomoran bukti kas masuk / kwitansi: `RCT-YYMM-NNNN` (misal: `RCT-2610-0001`).
3. **Model Pembayaran (Single Payment Lunas)**:
   - Satu invoice dilunasi secara penuh dalam satu transaksi pembayaran (Tunai / Transfer Bank BCA/BRI/Mandiri / QRIS).
4. **Otomatisasi Generator Tagihan (Self-healing & Idempotent Trigger)**:
   - Fungsi PostgreSQL `generate_due_student_invoices()` secara otomatis mengevaluasi seluruh program murid aktif (`student_programs.status = 'active'` dan `students.status = 'active'`).
   - Menerbitkan invoice secara otomatis saat tanggal hari ini memasuki periode tagihan siklus berjalan, tanpa duplikasi (`ON CONFLICT (student_id, program_id, period_start) DO NOTHING`).

---

## 2. Database Architecture & Ledger Design

### 2.1 Skema Tabel Baru

```
+---------------------------------------------------------------------------------------------------+
| 1. student_invoices (Faktur Tagihan SPP Murid)                                                    |
+---------------------------------------------------------------------------------------------------+
| - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()                                                  |
| - invoice_number: TEXT NOT NULL UNIQUE (Format: INV-YYMM-NNNN)                                    |
| - student_id: UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT                     |
| - program_id: UUID NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT                     |
| - variant_id: UUID NOT NULL REFERENCES public.program_variants(id) ON DELETE RESTRICT             |
| - branch_id: UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT                     |
| - period_start: DATE NOT NULL                                                                     |
| - period_end: DATE NOT NULL (period_start + cycle_days - 1)                                        |
| - due_date: DATE NOT NULL (default: period_start + 7 days)                                         |
| - cycle_number: INTEGER NOT NULL DEFAULT 1                                                        |
| - amount: INTEGER NOT NULL CHECK (amount >= 0)                                                    |
| - discount_amount: INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0)                         |
| - total_amount: INTEGER NOT NULL CHECK (total_amount >= 0)                                        |
| - status: TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'cancelled'))        |
| - notes: TEXT                                                                                     |
| - created_at: TIMESTAMPTZ NOT NULL DEFAULT now()                                                  |
| - updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()                                                  |
| - created_by: UUID REFERENCES public.profiles(id)                                                 |
| - CONSTRAINT: UNIQUE (student_id, program_id, period_start)                                       |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  | 1 : 1 (Single Payment Lunas)
                                                  v
+---------------------------------------------------------------------------------------------------+
| 2. student_payments (Bukti Penerimaan Kas / Official Receipt Kwitansi)                            |
+---------------------------------------------------------------------------------------------------+
| - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()                                                  |
| - receipt_number: TEXT NOT NULL UNIQUE (Format: RCT-YYMM-NNNN)                                    |
| - invoice_id: UUID NOT NULL UNIQUE REFERENCES public.student_invoices(id) ON DELETE RESTRICT       |
| - student_id: UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT                     |
| - amount_paid: INTEGER NOT NULL CHECK (amount_paid > 0)                                           |
| - payment_date: DATE NOT NULL DEFAULT CURRENT_DATE                                                |
| - payment_method: TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer_bca', 'transfer_bri',  |
|                                                           'transfer_mandiri', 'qris', 'other'))   |
| - payment_reference: TEXT (Nomor mutasi bank / catatan struk)                                     |
| - received_by: UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT                    |
| - notes: TEXT                                                                                     |
| - created_at: TIMESTAMPTZ NOT NULL DEFAULT now()                                                  |
+---------------------------------------------------------------------------------------------------+
```

### 2.2 Row Level Security (RLS)
- `student_invoices`:
  - `Admin manages student_invoices`: ALL untuk `is_admin()`.
  - `Guru reads branch student_invoices`: SELECT untuk guru pada murid di cabang penugasannya.
- `student_payments`:
  - `Admin manages student_payments`: ALL untuk `is_admin()`.
  - `Guru reads branch student_payments`: SELECT untuk guru pada murid di cabang penugasannya.

### 2.3 Stored Procedure & RPC Functions
1. `public.generate_due_student_invoices()`:
   - Mencari seluruh baris `student_programs` berstatus `active` dari `students` aktif.
   - Menghitung rentang siklus 28 hari: `period_start = cycle_start_date + (N * cycle_days)`.
   - Menghitung diskon tepat waktu jika `on_time_discount_type` aktif.
   - Membuat faktur tagihan berstatus `unpaid` dengan format sekuensial `INV-YYMM-NNNN`.
   - Mengembalikan daftar invoice yang baru dibuat.
2. `public.record_student_payment(p_invoice_id, p_payment_method, p_payment_date, p_payment_reference, p_notes)`:
   - Mengambil baris invoice `FOR UPDATE`.
   - Memvalidasi bahwa invoice berstatus `unpaid`.
   - Membuat nomor kwitansi sekuensial unik `RCT-YYMM-NNNN`.
   - Memasukkan baris kas masuk ke `student_payments`.
   - Mengubah status invoice menjadi `paid` dan memperbarui `updated_at`.
   - Mengembalikan data kwitansi dan invoice yang telah lunas.

---

## 3. Data Access Layer & Server Actions

### 3.1 DAL (`src/lib/billing.ts`)
- `getBillingSummary(filters: { branchId?: string; periodMonth?: string; status?: string })`: Mengambil metrik KPI ringkasan piutang, kas diterima, sisa tagihan, dan daftar invoice.
- `getInvoiceDetail(invoiceId: string)`: Mengambil data lengkap invoice, relasi murid, orang tua, program/varian, cabang, dan bukti pembayaran (jika lunas).
- `triggerCycleInvoiceGeneration()`: Memanggil RPC `generate_due_student_invoices()`.
- `recordPayment(input: RecordPaymentInput)`: Memanggil RPC `record_student_payment()`.

### 3.2 Server Actions (`src/app/admin/spp/actions.ts`)
- `generateCycleInvoicesAction()`: Memeriksa dan mengeksekusi generasi tagihan siklus. Memanggil `revalidatePath("/admin/spp")`.
- `recordPaymentAction(input)`: Mencatat pelunasan tagihan SPP dan menerbitkan kwitansi. Memanggil `revalidatePath("/admin/spp")`.
- `cancelInvoiceAction(invoiceId, reason)`: Membatalkan tagihan jika murid cuti/keluar sebelum siklus dimulai.

---

## 4. User Interface & User Experience

### 4.1 Navigasi Admin (`src/components/admin/admin-shell.tsx`)
- Ditambahkan ke kelompok **Operasional & Keuangan**:
  - `label`: "Tagihan SPP Murid"
  - `href`: `/admin/spp`
  - `icon`: `Receipt` / `CreditCard`
  - `roles`: `["admin"]`

### 4.2 Halaman Utama Tagihan SPP (`/admin/spp`)
1. **Header & Filter Bar**:
   - Filter Cabang (Semua Cabang / Sumokembangsri / Junwangi).
   - Filter Status Tagihan: Semua / Belum Lunas (`unpaid`) / Lunas (`paid`).
   - Pencarian: Nama murid, nomor induk murid (01001), atau nomor invoice.
   - Tombol Aksi: **"+ Terbitkan Tagihan Siklus"** (memicu generasi otomatis siklus yang jatuh tempo).
2. **KPI Summary Cards (4 Kartu)**:
   - **Total Tagihan**: Akumulasi nilai seluruh invoice siklus aktif.
   - **Kas Diterima**: Total uang yang telah lunas dibayarkan (Kwitansi).
   - **Piutang Tertunggak**: Total tagihan yang belum dibayar.
   - **Murid Belum Bayar**: Jumlah murid dengan tagihan aktif belum lunas.
3. **Tabel Data Tagihan & Aksi Cepat**:
   - Kolom: Nomor Invoice, Murid & Cabang, Program & Siklus 28 Hari, Nominal Tagihan, Jatuh Tempo, Status, Aksi.
   - Status Badge:
     - `Belum Bayar` (`bg-amber-50 text-amber-800 border-amber-200`)
     - `Lunas` (`bg-emerald-50 text-emerald-800 border-emerald-200`)
     - `Jatuh Tempo` (`bg-rose-50 text-rose-800 border-rose-200` bila `current_date > due_date`)
   - Tombol Aksi:
     - **Catat Bayar** (membuka modal pelunasan jika belum lunas).
     - **Lihat Kwitansi** (membuka modal slip resmi jika sudah lunas).
     - **Kirim WhatsApp** (membuka tautan WhatsApp orang tua dengan pesan otomatis).

### 4.3 Modal Pencatatan Pembayaran (`PaymentModal`)
- Input: Tanggal Pembayaran, Metode Pembayaran (Tunai, Transfer BCA, Transfer Mandiri, QRIS), Nomor Referensi Mutasi, Catatan.
- Menampilkan rincian nominal yang harus dibayar.
- Konfirmasi instan tanpa reload browser.

### 4.4 Kwitansi Resmi Digital (`OfficialReceiptModal`)
- Format standar kwitansi bimbel:
  - Header: Logo resmi Uzma Course, Nama Cabang, Alamat & Kontak.
  - Metadata: Nomor Kwitansi (`RCT-2610-0001`), Nomor Tagihan (`INV-2610-0001`), Tanggal Pelunasan.
  - Data Siswa: Nama Murid, Nomor Induk (01001), Nama Orang Tua / Wali.
  - Rincian Pembayaran: Nama Program & Varian, Periode Siklus 28 Hari (`DD MMM YYYY - DD MMM YYYY`), Nominal Pokok, Diskon, Total Bayar.
  - Metode Pembayaran & Admin Penerima Kas.
  - Tombol **"Cetak Kwitansi"** (menggunakan browser print view yang rapi tanpa elemen navigasi portal).

### 4.5 Generator Pengingat WhatsApp
- Format pesan ramah dan profesional:
  ```
  Halo Ayah/Bunda dari [Nama Murid],

  Kami dari Uzma Course [Nama Cabang] menginformasikan tagihan SPP untuk periode belajar [Tgl Mulai] s/d [Tgl Selesai]:
  - No. Tagihan: [No Invoice]
  - Program: [Nama Program] ([Varian])
  - Total Biaya: Rp [Nominal]
  - Jatuh Tempo: [Tgl Jatuh Tempo]

  Pembayaran dapat dilakukan secara tunai di cabang atau transfer ke rekening resmi Uzma Course:
  - BCA: 1234-5678-90 a.n. Uzma Course

  Mohon konfirmasi setelah melakukan pembayaran. Terima kasih atas kepercayaannya mendampingi ananda belajar bersama kami.
  ```

---

## 5. Security & Invariant Invariants

1. **Idempotensi Penerbitan Tagihan**:
   - `UNIQUE (student_id, program_id, period_start)` mencegah duplikasi tagihan untuk murid pada siklus program yang sama.
2. **Kwitansi Tunggal Per Tagihan**:
   - `invoice_id UNIQUE` pada `student_payments` menjamin tidak ada pencatatan kwitansi ganda untuk tagihan yang sama.
3. **Imutabilitas Kwitansi & Tagihan Lunas**:
   - Setelah tagihan berstatus `paid` dan kwitansi diterbitkan, data terkunci dan tidak dapat diubah tanpa prosedur pembatalan resmi.
4. **Validasi Peran Admin**:
   - Seluruh mutasi pencatatan kas dan pembuatan tagihan dilindungi `requireAdminAction()`. Guru hanya memiliki akses baca di cabangnya.

---

## 6. Testing Strategy & Plan

1. **Unit & Calculation Tests (`tests/lib/billing-calculation.test.ts`)**:
   - Menguji perhitungan siklus 28 hari, tanggal jatuh tempo, dan kalkulasi diskon tepat waktu.
2. **Schema & Migration Contract Tests (`tests/security/billing-migration-schema.test.ts`)**:
   - Menguji batasan tabel `student_invoices`, `student_payments`, foreign keys, RLS policies, dan keunikan invoice/receipt.
3. **DAL & Action Tests (`tests/crud/billing-dal.test.ts`, `tests/security/billing-actions.test.ts`)**:
   - Menguji generator siklus, pencegahan duplikasi, pencatatan kas, dan revalidasi cache.
4. **UI Component Tests (`tests/components/billing-client.test.tsx`, `tests/components/receipt-modal.test.tsx`)**:
   - Menguji rendering tabel, modal pembayaran, kwitansi, dan tombol WhatsApp.
5. **Full Harness Verification**:
   - `./init.sh` lulus 100% (ESLint, Vitest coverage, production build).
   - Browser smoke test: Viewport 360px, 375px, 1280px dengan 0 horizontal overflow.
