-- Migration: Normalize programs and branches tables and relations
-- 1a. Create branches table
CREATE TABLE public.branches (
  id TEXT PRIMARY KEY,                     -- 'balongbendo', 'krian'
  name TEXT NOT NULL,                      -- 'Cabang Balongbendo'
  sub_name TEXT NOT NULL DEFAULT '',       -- 'Ahe Sumokembangsri'
  address TEXT NOT NULL DEFAULT '',
  latitude NUMERIC(10,7),                  -- for Phase 2 geofencing
  longitude NUMERIC(10,7),
  geofence_radius_m INT NOT NULL DEFAULT 100,
  map_embed_url TEXT,                      -- Google Maps embed
  gmaps_url TEXT,                          -- Google Maps navigation link
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.branches (id, name, sub_name, address, latitude, longitude, map_embed_url, gmaps_url)
VALUES
  ('balongbendo', 'Cabang Balongbendo', 'Ahe Sumokembangsri',
   'Sumotuwo, RT 20 RW 3, Sumokembangsri, Balongbendo, Sidoarjo',
   -7.4320527, 112.5054893,
   'https://www.google.com/maps?q=-7.4320527,112.5054893&output=embed',
   'https://maps.app.goo.gl/qaJuRjZcDDTv4qQx9'),
  ('krian', 'Cabang Krian', 'Ahe Junwangi',
   'Junwatu, RT 2 RW 1, Junwangi, Krian, Sidoarjo',
   -7.4062116, 112.6081986,
   'https://www.google.com/maps?q=-7.4062116,112.6081986&output=embed',
   'https://maps.app.goo.gl/KWoXUAYNvVJTYs5r5');

-- 1b. Migrate branch_id CHECK constraints to FK
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_branch_id_check;
ALTER TABLE public.students ADD CONSTRAINT students_branch_id_fkey
  FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_branch_id_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_branch_id_fkey
  FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE;

-- 1c. Create programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initials TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  age_range TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  type TEXT NOT NULL DEFAULT 'original' CHECK (type IN ('franchise', 'original')),
  logo_url TEXT,
  license_provider TEXT,
  license_url TEXT,
  license_description TEXT,
  system TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL DEFAULT '',
  features TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1d. Seed programs
INSERT INTO public.programs (initials, name, tagline, description, age_range, icon, type, license_provider, system, duration, frequency, features, sort_order)
VALUES
  ('AHE', 'Les Baca Tulis (AHE)', 'Belajar Baca & Tulis Cepat dan Menyenangkan',
   'Metode AHE yang teruji klinis dan ramah anak. Membantu anak lancar membaca dan menulis tanpa mengeja dan tanpa beban.',
   'Mulai 3,5 tahun', 'BookOpen', 'franchise', 'Ahe Indonesia', '1 guru max 2 murid', '30 menit / sesi', '3x / minggu (12x / bulan)',
   ARRAY['Buku Modul Eksklusif','Buku Penghubung','Piagam & Piala Kelulusan'], 0),
  ('ASE', 'Ala Sekolah (ASE)', 'Stimulasi Tumbuh Kembang Sensori & Kognitif',
   'Program stimulasi sensori, motorik, dan kesiapan belajar bagi anak usia dini dengan metode interaktif yang menyenangkan.',
   'Mulai 3 tahun', 'Sparkles', 'franchise', 'Ahe Indonesia', '1 guru max 2 murid', '30 menit / sesi', '3x / minggu (12x / bulan)',
   ARRAY['Buku Modul','Buku Penghubung','Permainan Sensori Motorik'], 1),
  ('BEE', 'Brainy English Education (BEE)', 'English Made Fun for Kids',
   'Program bahasa Inggris interaktif untuk membangun kosakata, pelafalan, dan keberanian berbicara bahasa Inggris sejak kecil.',
   'Mulai 4 tahun', 'Globe', 'franchise', 'Brainy English Education', '1 guru max 2 murid', '30 menit / sesi', '3x / minggu (12x / bulan)',
   ARRAY['Buku Modul Bergambar','Buku Penghubung','Interactive Games'], 2),
  ('MAPEL', 'Les Mata Pelajaran SD', 'Pendampingan Belajar Kurikulum Sekolah',
   'Bimbingan belajar private intensif untuk memahami materi sekolah reguler, persiapan ulangan harian, PTS, PAS, dan PR.',
   'Siswa SD', 'GraduationCap', 'original', NULL, 'Private 1 guru 1 murid', '30 menit / sesi', '3x / minggu (12x / bulan)',
   ARRAY['Private 1 Guru 1 Murid','Buku Penghubung','Bimbingan PR & Ujian'], 3);

-- 1e. Create junction tables
CREATE TABLE public.student_programs (
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT,
  spp_amount NUMERIC NOT NULL DEFAULT 0,   -- monthly tuition fee, per-student per-program (Rupiah)
  enrolled_at DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cuti', 'lulus', 'keluar')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (student_id, program_id)
);

CREATE TABLE public.profile_programs (
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, program_id)
);

-- 1f. Migrate existing TEXT[] data to junction tables
INSERT INTO public.student_programs (student_id, program_id)
SELECT s.id, p.id
FROM public.students s, unnest(s.programs) AS slug
JOIN public.programs p ON p.initials = UPPER(slug)
ON CONFLICT (student_id, program_id) DO NOTHING;

INSERT INTO public.profile_programs (profile_id, program_id)
SELECT pr.id, p.id
FROM public.profiles pr, unnest(pr.programs) AS slug
JOIN public.programs p ON p.initials = UPPER(slug)
WHERE pr.programs IS NOT NULL AND array_length(pr.programs, 1) > 0
ON CONFLICT (profile_id, program_id) DO NOTHING;

-- Drop old TEXT[] columns
ALTER TABLE public.students DROP COLUMN programs;
ALTER TABLE public.profiles DROP COLUMN programs;

-- 1g. RLS on new tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Branches are viewable by everyone" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Branches are manageable by admins" ON public.branches FOR ALL USING (public.is_admin());

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programs are viewable by everyone" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Programs are manageable by admins" ON public.programs FOR ALL USING (public.is_admin());

ALTER TABLE public.student_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages student_programs" ON public.student_programs FOR ALL USING (public.is_admin());
CREATE POLICY "Guru reads branch student_programs" ON public.student_programs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.students st
    JOIN public.profiles pr ON pr.id = auth.uid()
    WHERE st.id = student_programs.student_id
      AND pr.role = 'guru' AND pr.branch_id = st.branch_id
  ));

ALTER TABLE public.profile_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages profile_programs" ON public.profile_programs FOR ALL USING (public.is_admin());
CREATE POLICY "User reads own profile_programs" ON public.profile_programs FOR SELECT USING (profile_id = auth.uid());

-- 1h. Indexes
CREATE INDEX idx_students_branch_active ON public.students(branch_id, is_active);
CREATE INDEX idx_profiles_branch_role ON public.profiles(branch_id, role);
CREATE INDEX idx_student_programs_program ON public.student_programs(program_id);
CREATE INDEX idx_profile_programs_program ON public.profile_programs(program_id);

-- 1i. FK and security fixes
ALTER TABLE public.landing_content DROP CONSTRAINT IF EXISTS landing_content_updated_by_fkey;
ALTER TABLE public.landing_content ADD CONSTRAINT landing_content_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 1j. Strip program items from landing_content
UPDATE public.landing_content
SET content = jsonb_build_object('title', content->'title', 'subtitle', content->'subtitle')
WHERE section = 'programs';
