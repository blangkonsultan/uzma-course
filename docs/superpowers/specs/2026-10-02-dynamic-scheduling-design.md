# Spec: Dynamic Scheduling & Time Validation (Kanban Board)

## 1. Tujuan
Memungkinkan admin untuk menjadwalkan guru dalam beberapa sesi di satu shift yang sama (termasuk program yang sama), menetapkan jam mulai dan selesai yang spesifik untuk tiap kelas, memvalidasi agar tidak terjadi tabrakan jadwal, dan membuat antarmuka papan (Kanban) menjadi lebih reaktif dan mudah dicari.

## 2. Perubahan Database (Skema)
Tabel: `schedule_classes`
- **Hapus Constraint:** Menghapus `CONSTRAINT uq_teacher_shift_day`.
- **Tambah Kolom:** 
  - `start_time` (Tipe: `TIME NOT NULL`)
  - `end_time` (Tipe: `TIME NOT NULL`)
- *Catatan:* Durasi diambil dari relasi ke tabel `program_variants(duration)`.

## 3. Alur Antarmuka (UI/UX)
### A. Modal Pembuatan Wadah Kelas (Drag Guru -> Shift)
1. Saat admin men-drag kartu Guru ke kolom Shift, muncul Modal "Atur Waktu Kelas".
2. **Auto-suggest Jam Mulai:** 
   - Jika guru belum memiliki kelas di shift tersebut: Otomatis terisi `start_time` dari Shift (misal 09:00).
   - Jika guru sudah memiliki kelas di shift tersebut: Otomatis terisi waktu setelah kelas terakhir guru tersebut selesai (misal kelas sebelumnya selesai 10:00, maka terisi 10:00).
3. **Jam Selesai:** Dihitung otomatis berdasarkan `start_time` + `program_variants.duration`, ditampilkan secara *read-only* atau di-update reaktif.
4. Admin klik Simpan -> Wadah kelas dirender di papan dengan label jam (contoh: "10:00 - 11:00").

### B. Filter Reaktif & Kuota (Sidebar)
1. **Murid (Student):** Saat murid di-drag ke dalam kelas (placement berhasil), status murid di *sidebar* langsung diperbarui. Jika murid tersebut telah mencapai batas kehadiran per pekan (kuota penuh, misalnya sudah dijadwalkan 2x dalam draft ini), nama murid tersebut disembunyikan dari daftar *sidebar*.
2. **Guru (Teacher):** Kapasitas guru dihitung berdasarkan sisa waktu kosong di seluruh shift. Jika seorang guru sudah terjadwal penuh dan tidak memiliki sisa waktu yang cukup untuk mengajar satu varian program apa pun, guru tersebut dihilangkan dari daftar *sidebar*.

### C. Fitur Pencarian (Board Search)
Menambahkan kotak pencarian global di bagian atas papan Kanban. 
- Mengetik nama di sini akan memfilter daftar Guru dan Murid di *sidebar* secara *real-time*.
- (Opsional/Bonus) Menyorot (*highlight*) kartu kelas di dalam papan yang cocok dengan nama guru/murid yang dicari.

## 4. Validasi Keamanan (Backend Server Action)
Saat fungsi `createScheduleClass` dipanggil dari Modal:
1. **Validasi Batas Shift:** `start_time` kelas tidak boleh lebih awal dari `start_time` shift, dan `end_time` kelas tidak boleh melebihi `end_time` shift.
2. **Validasi Tabrakan (Overlap):** Untuk guru yang sama di hari yang sama, rentang `start_time` hingga `end_time` kelas yang baru tidak boleh beririsan (overlap) dengan sesi kelas lain milik guru tersebut.

## 5. Rencana Pengujian
1. **Unit/Integration Test:** Mencoba membuat kelas yang menabrak jam shift (harus error).
2. **Unit/Integration Test:** Mencoba membuat kelas yang menabrak jam kelas lain milik guru yang sama (harus error).
3. **End-to-End (Manual):** Drag guru, ubah jam di modal, simpan, pastikan kartu muncul dengan jam yang benar dan state sidebar terupdate.

## 6. Catatan Integrasi Sistem Presensi (ERP Phase 2)
Karena setiap kelas kini memiliki `start_time` spesifik, maka batas keterlambatan guru dihitung secara dinamis **per shift**.
- Jika shift buka jam 09:00, namun jadwal kelas pertama guru tersebut **pada shift tersebut** ada di jam 09:30, maka batas telat guru untuk shift itu adalah 09:30.
- (Berlaku terpisah untuk tiap shift di hari yang sama, misalnya batas telat Shift Pagi dihitung dari sesi pertama pagi, dan batas telat Shift Sore dihitung dari sesi pertama sore).
- Informasi jadwal ini akan menjadi acuan untuk sistem *Clock-in/out* dan kalkulasi potongan telat per shift pada modul Presensi selanjutnya.
