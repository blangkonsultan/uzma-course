ALTER TABLE public.program_variants ADD COLUMN IF NOT EXISTS show_on_landing BOOLEAN NOT NULL DEFAULT true;
