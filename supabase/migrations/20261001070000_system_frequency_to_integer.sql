-- Convert programs.system and programs.frequency from TEXT to INTEGER
-- system: maximum students per teacher/session (e.g. 1 guru max 2 murid -> 2)
-- frequency: sessions per week (e.g. 3x / minggu -> 3)

ALTER TABLE public.programs
  ALTER COLUMN system DROP DEFAULT,
  ALTER COLUMN system TYPE INTEGER
    USING CASE
      WHEN system ILIKE '%4 murid%' OR system ILIKE '%max 4%' THEN 4
      WHEN system ILIKE '%2 murid%' OR system ILIKE '%max 2%' THEN 2
      WHEN system ILIKE '%1 murid%' OR system ILIKE '%private%' OR system ILIKE '%privat%' THEN 1
      ELSE COALESCE(NULLIF(regexp_replace(system, '[^0-9]', '', 'g'), ''), '2')::INTEGER
    END,
  ALTER COLUMN system SET DEFAULT 2;

ALTER TABLE public.programs
  ALTER COLUMN frequency DROP DEFAULT,
  ALTER COLUMN frequency TYPE INTEGER
    USING CASE
      WHEN frequency ~ '^[0-9]+' THEN substring(frequency from '^[0-9]+')::INTEGER
      ELSE 3
    END,
  ALTER COLUMN frequency SET DEFAULT 3;
