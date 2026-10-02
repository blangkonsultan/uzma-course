-- Add column to program_variants
ALTER TABLE public.program_variants ADD COLUMN IF NOT EXISTS frequency INTEGER NOT NULL DEFAULT 3;

-- Migrate data from programs to program_variants
UPDATE public.program_variants pv
SET frequency = p.frequency
FROM public.programs p
WHERE pv.program_id = p.id;

-- Drop column from programs
ALTER TABLE public.programs DROP COLUMN IF EXISTS frequency;
