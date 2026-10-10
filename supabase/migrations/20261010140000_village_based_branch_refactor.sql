-- Migration: Village-Based Branch Refactor & Administrative Hierarchy
-- Description: Adds kecamatan and desa columns to branches, aligns foreign keys to ON UPDATE CASCADE,
-- and updates existing branch IDs and names from Balongbendo/Krian to Sumokembangsri/Junwangi.

-- 1. Add structured region columns to branches table
ALTER TABLE public.branches 
ADD COLUMN IF NOT EXISTS kecamatan TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS desa TEXT NOT NULL DEFAULT '';

-- 2. Update foreign key constraints to ON UPDATE CASCADE
ALTER TABLE public.branch_shifts
DROP CONSTRAINT IF EXISTS branch_shifts_branch_id_fkey,
ADD CONSTRAINT branch_shifts_branch_id_fkey 
  FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.schedule_drafts
DROP CONSTRAINT IF EXISTS schedule_drafts_branch_id_fkey,
ADD CONSTRAINT schedule_drafts_branch_id_fkey 
  FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_attendances') THEN
    ALTER TABLE public.teacher_attendances
    DROP CONSTRAINT IF EXISTS teacher_attendances_branch_id_fkey,
    ADD CONSTRAINT teacher_attendances_branch_id_fkey 
      FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profile_branches') THEN
    ALTER TABLE public.profile_branches
    DROP CONSTRAINT IF EXISTS profile_branches_branch_id_fkey,
    ADD CONSTRAINT profile_branches_branch_id_fkey 
      FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Atomic Branch Data Update: Balongbendo -> Sumokembangsri
UPDATE public.branches
SET 
  id = 'sumokembangsri',
  name = 'Cabang Sumokembangsri',
  sub_name = 'Ahe Sumokembangsri',
  kecamatan = 'Balongbendo',
  desa = 'Sumokembangsri',
  updated_at = now()
WHERE id = 'balongbendo';
UPDATE public.branches
SET 
  kecamatan = 'Balongbendo',
  desa = 'Sumokembangsri'
WHERE id = 'sumokembangsri' AND (kecamatan = '' OR kecamatan IS NULL);
UPDATE public.branches
SET 
  id = 'junwangi',
  name = 'Cabang Junwangi',
  sub_name = 'Ahe Junwangi',
  kecamatan = 'Krian',
  desa = 'Junwangi',
  updated_at = now()
WHERE id = 'krian';

UPDATE public.branches
SET 
  kecamatan = 'Krian',
  desa = 'Junwangi'
WHERE id = 'junwangi' AND (kecamatan = '' OR kecamatan IS NULL);
-- 5. Update Landing Page Locations JSON
UPDATE public.landing_content
SET content = jsonb_set(
  content,
  '{items}',
  '[
    {
      "id": "sumokembangsri",
      "name": "Cabang Sumokembangsri",
      "mapUrl": "https://www.google.com/maps?q=-7.4320527,112.5054893&output=embed",
      "address": "Sumotuwo, RT 20 RW 3, Sumokembangsri, Balongbendo, Sidoarjo",
      "subName": "Ahe Sumokembangsri",
      "gmapsUrl": "https://maps.app.goo.gl/qaJuRjZcDDTv4qQx9"
    },
    {
      "id": "junwangi",
      "name": "Cabang Junwangi",
      "mapUrl": "https://www.google.com/maps?q=-7.4062116,112.6081986&output=embed",
      "address": "Junwatu, RT 2 RW 1, Junwangi, Krian, Sidoarjo",
      "subName": "Ahe Junwangi",
      "gmapsUrl": "https://maps.app.goo.gl/KWoXUAYNvVJTYs5r5"
    }
  ]'::jsonb
)
WHERE section = 'locations';
