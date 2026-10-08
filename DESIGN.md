---
name: Uzma Course
description: Pusat bimbingan belajar dengan metode ramah anak dan bebas trauma
colors:
  primary: "#9333ea"
  primary-deep: "#581c87"
  primary-light: "#f3e8ff"
  accent: "#be3099"
  accent-light: "#d946a8"
  neutral-bg: "#f8fafc"
  neutral-surface: "#ffffff"
  neutral-text: "#334155"
typography:
  display:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "700"
  headline:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "600"
  title:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "600"
  body:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "400"
  label:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "500"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.full}"
    padding: "8px 24px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.2xl}"
    padding: "32px"
---

# Design System: Uzma Course

## Overview

**Creative North Star: "The Friendly Classroom"**

Sistem desain Uzma Course dibangun di atas filosofi ramah, hangat, dan bebas trauma. Kami percaya bahwa antarmuka pendidikan harus terasa mengayomi, bukan mengintimidasi. Oleh karena itu, bahasa visual kami secara sadar menghindari kesan kaku dan korporat (garis tajam dan kisi yang kaku) dan beralih ke bentuk yang lebih organik dan lembut. Pendekatan ini menciptakan ruang digital yang aman baik bagi staf operasional (admin/guru) maupun pelanggan (orang tua).

**Key Characteristics:**
- Sudut melengkung ekstrem (*pill-shaped* dan *large radius*) pada elemen interaktif.
- Warna yang menenangkan (*Calm & Nurturing*) namun tetap mempertahankan kejelasan operasional.
- Ruang putih (*whitespace*) yang lapang untuk mengurangi beban kognitif.
- Nuansa elemen yang mengambang lembut (*lifted*).

## Colors

Palet warna menyampaikan rasa ketenangan dan pengayoman (Calm & Nurturing) melalui perpaduan warna Ungu yang stabil dan Magenta yang hangat.

### Primary
- **Nurturing Purple** (#9333ea): Aksi utama, status aktif, dan fondasi identitas merek. Warna ini memancarkan profesionalisme pendidikan tanpa terasa dingin.
- **Deep Purple** (#581c87): Teks tebal atau latar belakang kontras tinggi.
- **Soft Purple** (#f3e8ff): Kondisi *hover* atau latar belakang sekunder.

### Secondary
- **Warm Magenta** (#be3099): Aksen energi dan penyorotan informasi sekunder.
- **Bright Magenta** (#d946a8): Transisi dan elemen interaktif aksen.

### Neutral
- **Slate Text** (#334155): Warna teks utama. Tidak menggunakan hitam murni untuk mengurangi kelelahan mata.
- **Surface White** (#ffffff): Latar belakang kartu utama.
- **Slate Background** (#f8fafc): Latar belakang aplikasi (*canvas*).

### Named Rules
**The Non-Corporate Rule.** Hindari penggunaan abu-abu monokromatik ekstrem atau palet baja/biru korporat. Jika butuh warna abu-abu, selalu gunakan Slate (abu-abu dengan hint kebiruan yang hangat).

## Typography

**Display Font:** Poppins
**Body Font:** Poppins

**Character:** Poppins, dengan struktur geometrisnya yang membulat, secara sempurna mendukung narasi "Friendly Classroom". Font ini mudah dibaca oleh segala rentang usia dan memancarkan kesan bersahabat secara inheren.

### Hierarchy
- **Display** (Bold 700): Headline *landing page* dan judul utama aplikasi.
- **Headline** (SemiBold 600): Judul halaman (PageHeader) dan judul kartu (Card).
- **Title** (SemiBold 600): Label form dan pengelompokan data.
- **Body** (Regular 400): Teks paragraf dan isi tabel.
- **Label** (Medium 500, tight tracking): Tombol, *badge* status, dan metadata kecil.

## Layout

Tata letak (*layout*) berfokus pada ruang dan pemisahan yang jelas. Antarmuka menggunakan wadah (*container*) terpusat pada *desktop* dan mengalir satu kolom penuh pada *mobile*. Kami menggunakan jarak yang longgar antar kelompok informasi untuk menghindari kesan bertumpuk.

## Elevation & Depth

Sistem ini sangat bergantung pada bayangan lembut untuk menciptakan kedalaman spasial. Elemen tidak sekadar diletakkan di atas kanvas, melainkan mengambang di atasnya ("Lifted").

### Shadow Vocabulary
- **Ambient Lift** (`shadow-2xs` / `shadow-sm`): Memberikan kedalaman samar pada kartu dan tombol utama, membuatnya terasa taktis (*tactile*) dan dapat ditekan.
- **Floating Panel** (`shadow-md` / `shadow-lg` / `shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]`): Mengangkat modal, *sticky header*, atau panel navigasi jauh ke atas antarmuka lainnya, menegaskan bahwa elemen ini melayang menembus batas halaman.

## Shapes

Bentuk geometri adalah identitas terkuat kami. "Aman dan tidak kaku" dicapai melalui dua aturan kelengkungan absolut:
1. Elemen aksi (Tombol, Badge, Label Status) selalu menggunakan bentuk pil (`rounded-full`).
2. Elemen penampung struktural (Kartu, Modal) menggunakan radius besar (`rounded-2xl`).
Garis lurus 90 derajat dilarang untuk segala perbatasan luar (*outer borders*).

## Components

### Buttons
- **Shape:** Bentuk pil melingkar penuh (`rounded-full`).
- **Primary:** Latar belakang Nurturing Purple dengan teks putih, diangkat oleh `shadow-2xs`.
- **Hover / Focus:** Transisi ke Nurturing Purple yang lebih gelap dengan cincin fokus (*focus ring*) yang jelas.

### Cards / Containers
- **Corner Style:** Radius ekstra besar (`rounded-2xl`).
- **Background:** Putih solid.
- **Shadow Strategy:** Terangkat lembut dari latar belakang abu-abu menggunakan `shadow-md` atau border halus `slate-100`.
- **Internal Padding:** Luas dan nyaman, sering kali `p-8` atau lebih tinggi untuk desktop.

### Inputs / Fields
- **Style:** Stroke lembut `slate-200` dengan latar belakang putih dan kelengkungan membulat (`rounded-xl` atau `rounded-lg`).
- **Focus:** Cincin fokus ungu (`ring-primary-500/20`) dipadu batas ungu, memberikan umpan balik visual yang responsif.

## Do's and Don'ts

### Do:
- **Do** pertahankan *corner radius* ekstrem (`rounded-full` dan `rounded-2xl`) di seluruh komponen baru untuk menjaga konsistensi.
- **Do** gunakan varian warna yang menenangkan (Ungu & Magenta) daripada merah atau biru kaku untuk sistem notifikasi dan interaksi.
- **Do** maksimalkan *whitespace* antarelemen.

### Don't:
- **Don't** gunakan sudut kotak (0px radius) di elemen *container* apa pun.
- **Don't** menjejalkan data secara padat. Jika terlalu banyak informasi, gunakan paginasi, *scroll* internal, atau teknik *progressive disclosure*.
- **Don't** gunakan warna hitam absolut `#000000` untuk teks, gunakan Slate untuk meminimalisasi tegangan mata.
