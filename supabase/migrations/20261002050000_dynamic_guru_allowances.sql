-- Add new columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allowances JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS minimum_income INTEGER;

-- Migrate existing data
UPDATE public.profiles
SET 
  minimum_income = morning_guarantee_threshold,
  allowances = COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object('name', k, 'amount', v)
    )
    FROM (
      VALUES 
        ('Tunjangan Transportasi', allowance_transport),
        ('Tunjangan Kehadiran', allowance_presence),
        ('Tunjangan Kreativitas', allowance_creativity),
        ('Tunjangan Pendidikan', allowance_education)
    ) AS t(k,v)
    WHERE v > 0
  ), '[]'::jsonb)
WHERE role = 'guru';

-- Drop old columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS allowance_transport;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS allowance_presence;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS allowance_creativity;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS allowance_education;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS morning_guarantee_threshold;
