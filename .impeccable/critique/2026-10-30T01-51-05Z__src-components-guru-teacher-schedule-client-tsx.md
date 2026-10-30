---
target: src/components/guru/teacher-schedule-client.tsx
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
target_identity: "file:/home/bagas/projects/laragon/uzma-course/src/components/guru/teacher-schedule-client.tsx"
target_fingerprint: "sha256:155b9e0b0a117784c1b4f39eda5ff4d03297d6f6d1870215cf0907dae133e04a"
target_path: /home/bagas/projects/laragon/uzma-course/src/components/guru/teacher-schedule-client.tsx
timestamp: 2026-10-30T01-51-05Z
slug: src-components-guru-teacher-schedule-client-tsx
---
# Critique: Teacher Overdue SPP Indicator & Schedule View

Method: dual-agent (A: AssessmentA [Claude Opus 4.6] · B: AssessmentB [Deterministic Inspector])

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3/4 | Fallback saat query gagal belum didefinisikan secara eksplisit |
| 2 | Match System / Real World | 4/4 | Terminologi natural Indonesia (Jatuh tempo, Tagihan, Rp) |
| 3 | User Control and Freedom | 3/4 | Informasi murni read-only, aman dari salah aksi |
| 4 | Consistency and Standards | 2/4 | Penggunaan emoji ⚠️ alih-alih Lucide icon; bentuk token belum di-pin |
| 5 | Error Prevention | 3/4 | Desain read-only mencegah salah input tagihan oleh guru |
| 6 | Recognition Rather Than Recall | 4/4 | Informasi jatuh tempo tampil inline tanpa perlu buka menu lain |
| 7 | Flexibility and Efficiency | 2/4 | Belum ada filter/sort kelas berdasarkan status jatuh tempo |
| 8 | Aesthetic and Minimalist Design | 3/4 | Sinyal ganda (border + kotak info) berpotensi redundan |
| 9 | Error Recovery | 2/4 | `invoice_count` belum dimunculkan di UI; penanganan query error |
| 10 | Help and Documentation | 1/4 | Belum ada panduan konteks pertama kali fitur ini dilihat guru |
| **Total** | | **27/40** | **Moderate (Needs refinement on tokens & icons)** |

## Design Specificity Verdict

- **LLM Assessment (Claude Opus 4.6):** Desain selaras dengan filosofi *"The Friendly Classroom"* — informatif, berbasis empati lisan, dan tidak menghakimi. Namun, draf sebelumnya masih berada pada level deskripsi visual umum tanpa penetapan token Tailwind yang terverifikasi kontrasnya.
- **Deterministic Scan (`impeccable detect`):** 0 pelanggaran otomatis terdeteksi pada komponen eksisting. Namun inspeksi struktur mendeteksi toggle akordeon murid saat ini setinggi ~36px (di bawah standar `min-h-11` / 44px untuk mobile PWA).

## Priority Issues

- **[P0] Ganti Karakter Emoji `⚠️` dengan Komponen Ikon Lucide (`AlertTriangle`)**
  - *Why*: Emoji dirender berbeda-beda di iOS/Android/Windows dan merusak konsistensi desain sistem Uzma Course yang menggunakan Lucide.
  - *Fix*: Gunakan `<AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />`.
  - *Suggested command*: `$impeccable polish`
- **[P0] Kunci Token Warna Amber & Pastikan Kontras Aksesibilitas WCAG AA**
  - *Why*: Menggunakan amber teks yang terlalu terang pada background putih/amber muda berisiko gagal kontras WCAG AA (< 4.5:1).
  - *Fix*: Tetapkan token eksplisit: Badge `bg-amber-100 text-amber-800 rounded-full`, Kotak Info `bg-amber-50 border border-amber-200 text-amber-800 rounded-xl`, Ikon `text-amber-600`.
  - *Suggested command*: `$impeccable colorize`
- **[P1] Sederhanakan Visual: Hilangkan Border Aksen Tambahan pada Baris Murid**
  - *Why*: Kotak info amber di bawah nama murid sudah cukup jelas. Menambahkan border aksen kartu menciptakan sinyal visual ganda yang berlebih dan bergantung pada warna saja (*color-alone*).
  - *Fix*: Pertahankan border standar `border-slate-200/80` dan letakkan kotak info amber di bawah nama murid.
  - *Suggested command*: `$impeccable distill`
- **[P1] Terapkan `tabular-nums` pada Format Mata Uang**
  - *Why*: `DESIGN.md` mewajibkan `tabular-nums` untuk angka finansial agar lebar digit seragam.
  - *Fix*: Tambahkan `tabular-nums` pada styling nominal rupiah `Rp ...`.
  - *Suggested command*: `$impeccable typeset`
- **[P1] Tampilkan Jumlah Lembar Tagihan (`invoice_count`)**
  - *Why*: Guru membutuhkan konteks apakah tunggakan 1 bulan atau 2 bulan saat berbicara dengan orang tua.
  - *Fix*: Format info teks: `"{st.overdue_spp.invoice_count} tagihan jatuh tempo sejak {formatDateIndo(st.overdue_spp.due_date)} · Rp {total}"`.
  - *Suggested command*: `$impeccable clarify`
