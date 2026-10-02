-- Add branch code
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS code VARCHAR(2);
UPDATE public.branches SET code = '01' WHERE id = 'balongbendo';
UPDATE public.branches SET code = '02' WHERE id = 'krian';

-- Add student number and joined date
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_number VARCHAR(50) UNIQUE;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS joined_date DATE DEFAULT CURRENT_DATE;

-- Backfill joined_date from created_at for any existing students
UPDATE public.students SET joined_date = DATE(created_at) WHERE joined_date IS NULL;
