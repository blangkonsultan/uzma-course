-- Landing content table for managing dynamic landing page sections
CREATE TABLE public.landing_content (
  section TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read landing content (public landing page)
CREATE POLICY "Anyone reads landing content"
  ON public.landing_content FOR SELECT
  USING (true);

-- Only admins can manage landing content
CREATE POLICY "Admin manages landing content"
  ON public.landing_content FOR ALL
  USING (public.is_admin());

-- Updated at trigger
CREATE TRIGGER landing_content_updated_at
  BEFORE UPDATE ON public.landing_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed initial content for all 13 sections
INSERT INTO public.landing_content (section, content)
VALUES ('hero', '{"badgeText": "Reader now, Leader tomorrow!", "title": "Bimbingan Belajar Terbaik & Ramah Anak", "subtitle": "Les Baca AHE Sumokembangsri & AHE Junwangi — Uzma Course", "description": "Pusat bimbingan belajar calistung anak hebat di Sidoarjo. Melayani les baca AHE Sumokembangsri (Balongbendo) dan les baca AHE Junwangi (Krian) sejak 2022 dengan metode ceria tanpa trauma belajar.", "featurePills": ["Les Baca Tulis AHE", "Hitung Dasar", "Brainy English", "Mapel SD"], "primaryCtaText": "Daftar Sekarang", "secondaryCtaText": "Lihat Program", "secondaryCtaHref": "#programs"}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('programs', '{"title": "Program Belajar Unggulan", "subtitle": "Sistem belajar intensif dengan rasio murid kecil untuk hasil optimal dan anak senang belajar", "items": [{"id": "ahe", "initials": "AHE", "name": "Les Baca Tulis (AHE)", "tagline": "Belajar Baca & Tulis Cepat dan Menyenangkan", "description": "Metode AHE yang teruji klinis dan ramah anak. Membantu anak lancar membaca dan menulis tanpa mengeja dan tanpa beban.", "ageRange": "Mulai 3,5 tahun", "icon": "BookOpen", "system": "1 guru max 2 murid", "duration": "30 menit / sesi", "frequency": "3x / minggu (12x / bulan)", "features": ["Buku Modul Eksklusif", "Buku Penghubung", "Piagam & Piala Kelulusan"]}, {"id": "ase", "initials": "ASE", "name": "Anak Smart Edukasi (ASE)", "tagline": "Stimulasi Tumbuh Kembang Sensori & Kognitif", "description": "Program stimulasi sensori, motorik, dan kesiapan belajar bagi anak usia dini dengan metode interaktif yang menyenangkan.", "ageRange": "Mulai 3 tahun", "icon": "Sparkles", "system": "1 guru max 2 murid", "duration": "30 menit / sesi", "frequency": "3x / minggu (12x / bulan)", "features": ["Buku Modul", "Buku Penghubung", "Permainan Sensori Motorik"]}, {"id": "bee", "initials": "BEE", "name": "Brainy English Education (BEE)", "tagline": "English Made Fun for Kids", "description": "Program bahasa Inggris interaktif untuk membangun kosakata, pelafalan, dan keberanian berbicara bahasa Inggris sejak kecil.", "ageRange": "Mulai 4 tahun", "icon": "Globe", "system": "1 guru max 2 murid", "duration": "30 menit / sesi", "frequency": "3x / minggu (12x / bulan)", "features": ["Buku Modul Bergambar", "Buku Penghubung", "Interactive Games"]}, {"id": "mapel", "initials": "MAPEL", "name": "Les Mata Pelajaran SD", "tagline": "Pendampingan Belajar Kurikulum Sekolah", "description": "Bimbingan belajar private intensif untuk memahami materi sekolah reguler, persiapan ulangan harian, PTS, PAS, dan PR.", "ageRange": "Siswa SD", "icon": "GraduationCap", "system": "Private 1 guru 1 murid", "duration": "30 menit / sesi", "frequency": "3x / minggu (12x / bulan)", "features": ["Private 1 Guru 1 Murid", "Buku Penghubung", "Bimbingan PR & Ujian"]}, {"id": "hitung", "initials": "HITUNG", "name": "Les Hitung Dasar", "tagline": "Fondasi Matematika Dasar Ceria & Mudah", "description": "Program belajar konsep angka, penjumlahan, dan pengurangan dengan metode bertahap yang mudah dipahami anak usia dini.", "ageRange": "Mulai 4 tahun", "icon": "Calculator", "system": "1 guru max 4 murid", "duration": "30 menit / sesi", "frequency": "3x / minggu (12x / bulan)", "features": ["Buku Modul", "Buku Penghubung", "Permainan Angka Edukatif"]}]}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('why_us', '{"title": "Mengapa Uzma Course?", "subtitle": "Komitmen kami mendampingi putra-putri Anda belajar dengan nyaman, percaya diri, dan berprestasi", "items": [{"icon": "Award", "title": "Metode AHE Teruji", "description": "Menggunakan metode AHE yang telah terbukti efektif untuk anak usia dini."}, {"icon": "Users", "title": "Guru Berpengalaman", "description": "Pengajar terlatih dan bersertifikat dengan pengalaman mengajar anak."}, {"icon": "UserCheck", "title": "Kelas Kecil & Personal", "description": "Maksimal 5 anak per kelas untuk perhatian lebih personal."}, {"icon": "Clock", "title": "Jadwal Fleksibel", "description": "Pilihan jadwal yang bisa disesuaikan dengan aktivitas anak."}]}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('facilities', '{"title": "Fasilitas Ahe SumoWangi", "subtitle": "Kenyamanan dan sarana lengkap untuk mendukung proses belajar yang ceria, aman, dan kondusif", "items": [{"title": "Guru Berlisensi & Kompeten", "description": "Pengajar melalui seleksi ketat dan pelatihan resmi bersertifikat.", "icon": "Award"}, {"title": "Tempat Belajar Nyaman", "description": "Ruangan bersih, sejuk, dan kondusif untuk konsentrasi belajar anak.", "icon": "Home"}, {"title": "Piagam & Piala Kelulusan", "description": "Apresiasi pencapaian setiap level belajar untuk membangun rasa percaya diri.", "icon": "Trophy"}, {"title": "Kursi Tunggu Wali Murid", "description": "Fasilitas ruang tunggu yang nyaman bagi orang tua saat mengantar anak.", "icon": "Armchair"}, {"title": "Free Air Mineral & Free Wi-Fi", "description": "Kenyamanan ekstra selama berada di lokasi bimbingan belajar.", "icon": "Wifi"}, {"title": "Permainan Edukasi", "description": "Media edukatif interaktif untuk selingan belajar yang menyenangkan.", "icon": "Gamepad2"}, {"title": "Diskon SPP Setiap Bulan", "description": "Program apresiasi & promo menarik setiap bulan bagi murid (*S&K berlaku).", "icon": "BadgePercent"}, {"title": "Trial Class Gratis", "description": "1 sesi percobaan gratis untuk mencoba metode pengajaran secara langsung.", "icon": "Sparkles"}]}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('team', '{"title": "Pengelola & Tenaga Pendidik", "subtitle": "Didukung pengajar berdedikasi, tersertifikasi, dan penuh kasih mendampingi buah hati Anda", "teamPhotoUrl": "/images/team.jpg", "teamPhotoAlt": "Tim Pengajar Ahe SumoWangi", "teamBadge": "Tenaga Pengajar Berlisensi", "teamHeading": "Tim Pendidik Ramah & Berpengalaman", "teamDescription": "Pengajar melalui seleksi ketat dan pelatihan berkesinambungan untuk memastikan pendekatan belajar selalu sabar, suportif, dan menyenangkan bagi anak.", "founderName": "Nurul Ilmi Mega Puspita, S.Pd.", "founderRole": "Pengelola Ahe SumoWangi / Uzma Course", "founderQuote": "Lembaga bimbingan belajar di bawah naungan Ahe Indonesia yang melayani program belajar sejak 2022. Berkomitmen menghadirkan metode pengajaran ramah anak tanpa rasa takut atau trauma belajar.", "values": [{"title": "Tanpa Trauma", "description": "Pendekatan belajar bebas tekanan dan menyenangkan.", "icon": "Heart"}, {"title": "Sejak 2022", "description": "Telah meluluskan ratusan murid cerdas dan mandiri.", "icon": "Award"}], "galleryImageUrl": "/images/gallery-grid.jpg", "galleryImageAlt": "Galeri Kegiatan Belajar dan Wisuda Ahe SumoWangi", "galleryCaption": "Dokumentasi keceriaan belajar, pendampingan personal, dan momen wisuda kelulusan di Ahe SumoWangi."}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('testimonials', '{"title": "Kata Orang Tua Murid", "subtitle": "Pengalaman dan kepuasan para orang tua yang mempercayakan pendidikan putra-putrinya di Uzma Course", "items": [{"quote": "Alhamdulillah anak saya sekarang sudah lancar membaca dan berhitung sebelum masuk SD. Gurunya sangat sabar dan metodenya menyenangkan.", "parentName": "Ibu Rahma", "programLabel": "Orang Tua Murid AHE"}, {"quote": "Kemampuan bahasa Inggris anak saya meningkat pesat. Sekarang lebih percaya diri berbicara dan kosakatanya makin kaya.", "parentName": "Bapak Dimas", "programLabel": "Orang Tua Murid BEE"}, {"quote": "Nilai matematika dan IPA anak saya di SMP meningkat drastis setelah rutin les di Uzma Course. Pendampingannya sangat fokus.", "parentName": "Ibu Siti", "programLabel": "Orang Tua Murid Bimbel SMP"}, {"quote": "Anak saya selalu bersemangat tiap jadwal les. Pengajarnya ramah dan pendekatannya sangat personal untuk tiap anak.", "parentName": "Ibu Fitri", "programLabel": "Orang Tua Murid AHE & BEE"}]}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('videos', '{"title": "Video Kegiatan Kami", "subtitle": "Suasana belajar yang ceria, interaktif, dan penuh semangat di Uzma Course", "items": []}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('locations', '{"title": "Lokasi Kami", "subtitle": "Kunjungi cabang Uzma Course terdekat di area Sidoarjo untuk konsultasi langsung", "items": [{"id": "balongbendo", "name": "Cabang Balongbendo", "subName": "Ahe Sumokembangsri", "address": "Sumotuwo, RT 20 RW 3, Sumokembangsri, Balongbendo, Sidoarjo", "mapUrl": "https://www.google.com/maps?q=-7.4320527,112.5054893&output=embed", "gmapsUrl": "https://maps.app.goo.gl/qaJuRjZcDDTv4qQx9"}, {"id": "krian", "name": "Cabang Krian", "subName": "Ahe Junwangi", "address": "Junwatu, RT 2 RW 1, Junwangi, Krian, Sidoarjo", "mapUrl": "https://www.google.com/maps?q=-7.4062116,112.6081986&output=embed", "gmapsUrl": "https://maps.app.goo.gl/KWoXUAYNvVJTYs5r5"}]}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('faq', '{"title": "Frequently Asked Questions", "subtitle": "Pertanyaan yang sering diajukan seputar pendaftaran, metode belajar, dan fasilitas di Uzma Course", "items": [{"id": "faq-daftar", "question": "Bagaimana cara mendaftar?", "answer": "Hubungi kami via WhatsApp untuk konsultasi awal dan penjadwalan. Tim kami akan membantu memilih program yang paling sesuai dengan kebutuhan anak Anda."}, {"id": "faq-biaya", "question": "Berapa biaya per bulan?", "answer": "Biaya bervariasi per program dan cabang. Hubungi kami via WhatsApp untuk informasi rincian biaya dan promo yang sedang berlangsung."}, {"id": "faq-trial", "question": "Apakah ada kelas percobaan?", "answer": "Ya, kami menyediakan satu sesi percobaan gratis untuk setiap program agar anak dapat merasakan langsung suasana belajar di Uzma Course."}, {"id": "faq-jumlah", "question": "Berapa jumlah murid per kelas?", "answer": "Maksimal 5 anak per kelas untuk pembelajaran yang lebih personal, fokus, dan efektif bagi setiap murid."}, {"id": "faq-lokasi", "question": "Di mana lokasi les baca AHE Sumokembangsri dan AHE Junwangi?", "answer": "Uzma Course memiliki dua unit resmi di Sidoarjo: Unit les baca AHE Sumokembangsri (Sumotuwo, Balongbendo) dan unit les baca AHE Junwangi (Junwatu, Krian). Keduanya dilengkapi fasilitas belajar ramah anak dan guru berlisensi."}, {"id": "faq-usia", "question": "Kapan anak bisa mulai les baca AHE di Sumokembangsri atau Junwangi?", "answer": "Anak dapat mulai belajar les baca tulis AHE sejak usia 3,5 tahun. Metode AHE dirancang bertahap tanpa mengeja dan tanpa beban hafalan sehingga anak belajar dengan ceria tanpa rasa takut."}, {"id": "faq-jumlah-sesi", "question": "Berapa jumlah murid per sesi belajar?", "answer": "Sistem pembelajaran sangat privat dan personal: Les Baca AHE maksimal 2 anak per guru, Hitung Dasar maksimal 4 anak, BEE maksimal 2 anak, dan Bimbel Mapel 1 anak 1 guru (private)."}]}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('cta', '{"title": "Siap Memulai Perjalanan Belajar Anak Anda?", "subtitle": "Konsultasi gratis, daftar sekarang!", "buttonText": "Hubungi Kami via WhatsApp"}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('footer', '{"tagline": "Reader now, Leader tomorrow!", "socialLinks": {"instagram": "https://www.instagram.com/ahesumokembangsri.ahejunwangi", "facebook": "https://www.facebook.com/share/1JKAhpJnPP/?mibextid=qi2Omg"}, "contactPhone": "6285730332379", "contactWaDisplay": "085730332379", "navLinks": [{"label": "Program Belajar", "href": "#programs"}, {"label": "Keunggulan", "href": "#keunggulan"}, {"label": "Fasilitas", "href": "#fasilitas"}, {"label": "Pengelola & Guru", "href": "#pengelola"}, {"label": "Testimoni", "href": "#testimoni"}, {"label": "Lokasi Cabang", "href": "#lokasi"}, {"label": "FAQ", "href": "#faq"}]}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('navbar', '{"brandName": "Uzma Course", "navLinks": [{"label": "Program", "href": "#programs"}, {"label": "Keunggulan", "href": "#keunggulan"}, {"label": "Fasilitas", "href": "#fasilitas"}, {"label": "Pengelola", "href": "#pengelola"}, {"label": "Testimoni", "href": "#testimoni"}, {"label": "Lokasi", "href": "#lokasi"}, {"label": "FAQ", "href": "#faq"}], "ctaText": "Hubungi Kami"}'::jsonb)
ON CONFLICT (section) DO NOTHING;

INSERT INTO public.landing_content (section, content)
VALUES ('floating_wa', '{"isEnabled": true}'::jsonb)
ON CONFLICT (section) DO NOTHING;
