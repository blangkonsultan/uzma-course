# Student Billing & SPP Invoicing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun modul manajemen tagihan SPP murid (`feat-010` Sub-project 2) berbasis siklus belajar 28 hari dan kwitansi resmi standar akuntansi, dilengkapi portal admin, pencatatan kas masuk, kwitansi digital siap cetak, dan template WhatsApp orang tua.

**Architecture:**
- **Database Ledger**: Dua tabel akuntansi (`student_invoices`, `student_payments`) dengan nomor urut sekuensial unik (`INV-YYMM-NNNN` dan `RCT-YYMM-NNNN`), batasan integritas, RLS per role, serta 2 RPC PostgreSQL atomik (`generate_due_student_invoices` dan `record_student_payment`).
- **Data Access Layer**: `src/lib/billing.ts` mengabstraksi seluruh kueri database dan fungsi murni kalkulasi siklus 28 hari (`calculateCycleDates`).
- **Server Actions**: `src/app/admin/spp/actions.ts` mengeksekusi mutasi pencatatan kas dan pembuatan tagihan yang dilindungi `requireAdminAction()` dengan `revalidatePath("/admin/spp")`.
- **Admin UI**: `/admin/spp` menyediakan overview KPI bulanan, generator tagihan siklus otomatis, tabel status tagihan, modal pencatatan bayar, modal kwitansi resmi siap cetak, dan generator pesan WhatsApp orang tua murid.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase (PostgreSQL + RLS), Tailwind CSS v4, Lucide React, Vitest.

---

### Task 1: Siklus 28 Hari & Fungsi Kalkulasi Tagihan (TDD)

- [ ] **Step 1: Write calculation unit tests**
  - File: `tests/lib/billing-calculation.test.ts`
  - Test cases:
    - Menghitung rentang tanggal siklus 28 hari dari tanggal mulai: `calculateCycleDates(startDate, 28)`.
    - Menghitung tanggal jatuh tempo (default $H+7$ dari awal siklus).
    - Memformat nomor invoice dan kwitansi: `formatInvoiceNumber(year, month, sequence)` $\rightarrow$ `INV-2610-0001`.
    - Menghitung diskon tepat waktu nominal dan persentase.
  - Run: `npx vitest run tests/lib/billing-calculation.test.ts --coverage.enabled=false`
  - Expected: FAIL (module not found).

- [ ] **Step 2: Implement pure calculation functions**
  - File: `src/lib/billing-helpers.ts`
  - Functions: `calculateCycleDates`, `calculateDueDate`, `formatInvoiceNumber`, `formatReceiptNumber`, `calculateTuitionDiscount`.
  - Run: `npx vitest run tests/lib/billing-calculation.test.ts --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 3: Commit Task 1**
  - Run: `git add src/lib/billing-helpers.ts tests/lib/billing-calculation.test.ts && git commit -m "feat(billing): add cycle calculation helpers and test suite"`

---

### Task 2: Migrasi Database & RPC Akuntansi (TDD)

- [ ] **Step 1: Write migration contract test**
  - File: `tests/security/billing-migration-schema.test.ts`
  - Tests:
    - Memverifikasi pembuatan tabel `public.student_invoices` dan `public.student_payments`.
    - Memverifikasi format cek status `unpaid`, `paid`, `cancelled`.
    - Memverifikasi foreign keys ke `students`, `programs`, `program_variants`, `branches`, `profiles`.
    - Memverifikasi keunikan `UNIQUE (student_id, program_id, period_start)` dan `invoice_id UNIQUE`.
    - Memverifikasi ketersediaan RPC `generate_due_student_invoices` dan `record_student_payment`.
    - Memverifikasi hak akses RLS `is_admin()` dan pembacaan guru per cabang.
  - Run: `npx vitest run tests/security/billing-migration-schema.test.ts --coverage.enabled=false`
  - Expected: FAIL.

- [ ] **Step 2: Create SQL migration**
  - File: `supabase/migrations/20261017120000_create_student_billing.sql`
  - Content:
    - Skema tabel `student_invoices` & `student_payments` dengan sequencers penomoran `INV-%` dan `RCT-%`.
    - RPC `public.generate_due_student_invoices()` untuk membuat tagihan otomatis per siklus 28 hari.
    - RPC `public.record_student_payment(...)` untuk mencatat kas masuk dan menerbitkan kwitansi.
    - RLS policies dan security definer permissions.
  - Update: `src/types/database.ts` mencakup tipe tabel dan RPC baru.
  - Run: `npx vitest run tests/security/billing-migration-schema.test.ts --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 3: Commit Task 2**
  - Run: `git add supabase/migrations/20261017120000_create_student_billing.sql src/types/database.ts tests/security/billing-migration-schema.test.ts && git commit -m "feat(billing): add student invoices and receipts migration with RPCs"`

---

### Task 3: Data Access Layer & Server Actions (TDD)

- [ ] **Step 1: Write DAL & Server Action unit tests**
  - File: `tests/crud/billing-dal.test.ts` & `tests/security/billing-actions.test.ts`
  - Tests:
    - `getBillingSummary`: Mengambil metrik KPI dan daftar tagihan terfilter.
    - `getInvoiceDetail`: Mengambil data lengkap invoice beserta kwitansi penerimaan kas.
    - `generateCycleInvoicesAction`: Menolak eksekusi non-admin, memanggil generator RPC, memanggil `revalidatePath("/admin/spp")`.
    - `recordPaymentAction`: Menolak data tidak valid (nominal $\le 0$, metode kosong), memanggil RPC pembayaran, memanggil `revalidatePath`.
  - Run: `npx vitest run tests/crud/billing-dal.test.ts tests/security/billing-actions.test.ts --coverage.enabled=false`
  - Expected: FAIL.

- [ ] **Step 2: Implement DAL & Server Actions**
  - File: `src/lib/billing.ts` & `src/app/admin/spp/actions.ts`
  - Implementasi typed DAL dan Server Actions dengan otorisasi `requireAdminAction()`.
  - Run: `npx vitest run tests/crud/billing-dal.test.ts tests/security/billing-actions.test.ts --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 3: Commit Task 3**
  - Run: `git add src/lib/billing.ts src/app/admin/spp/actions.ts tests/crud/billing-dal.test.ts tests/security/billing-actions.test.ts && git commit -m "feat(billing): add DAL and admin server actions with authorization"`

---

### Task 4: Antarmuka Admin Tagihan SPP, Modal Pembayaran & Kwitansi Cetak (TDD)

- [ ] **Step 1: Write UI component tests**
  - File: `tests/components/billing-client.test.tsx` & `tests/components/receipt-modal.test.tsx`
  - Tests:
    - `BillingClient`: Menampilkan KPI cards, filter cabang & status, daftar tabel invoice.
    - `PaymentModal`: Menampilkan input metode bayar, nominal, submit pembayaran, dan penanganan error.
    - `OfficialReceiptModal`: Menampilkan nomor kwitansi `RCT-%`, stempel lunas, rincian siklus 28 hari, dan tombol cetak browser.
  - Run: `npx vitest run tests/components/billing-client.test.tsx tests/components/receipt-modal.test.tsx --coverage.enabled=false`
  - Expected: FAIL.

- [ ] **Step 2: Implement UI components & Admin Route**
  - Files:
    - `src/components/admin/billing/billing-client.tsx`
    - `src/components/admin/billing/payment-modal.tsx`
    - `src/components/admin/billing/official-receipt-modal.tsx`
    - `src/app/admin/spp/page.tsx`
    - Update `src/components/admin/admin-shell.tsx` menambahkan menu navigasi "Tagihan SPP Murid" (`/admin/spp`).
  - Run: `npx vitest run tests/components/billing-client.test.tsx tests/components/receipt-modal.test.tsx --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 3: Commit Task 4**
  - Run: `git add src/components/admin/billing/ src/app/admin/spp/ src/components/admin/admin-shell.tsx tests/components/billing-client.test.tsx tests/components/receipt-modal.test.tsx && git commit -m "feat(billing): add admin billing dashboard, payment modal, and official receipt"`

---

### Task 5: Verifikasi Full Harness & Pembaruan Pelacak

- [ ] **Step 1: Run mechanical detector & lint**
  - Run: `./.claude/skills/impeccable/scripts/impeccable detect --json src/`
  - Run: `npm run lint`
  - Expected: 0 errors / 0 warnings.

- [ ] **Step 2: Run full verification suite**
  - Run: `./init.sh`
  - Expected: 100% test suites passed, coverage aman, Webpack build sukses.

- [ ] **Step 3: Update documentation & tracking**
  - Files: `feature_list.json` (tandai `feat-010` `completed`), `progress.md`, `session-handoff.md`, dan Obsidian vault.
  - Run: `git add feature_list.json progress.md session-handoff.md && git commit -m "docs: mark feat-010 Payroll & Student Billing completed"`

- [ ] **Step 4: Push to remote origin**
  - Run: `git push origin main`
