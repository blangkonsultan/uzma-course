-- Convert duration from TEXT to INTEGER (minutes)
-- Existing values are all '30 menit / sesi'; extract leading digits
-- Drop existing text default before type conversion, then set integer default
ALTER TABLE public.programs
  ALTER COLUMN duration DROP DEFAULT,
  ALTER COLUMN duration TYPE INTEGER
    USING COALESCE(NULLIF(regexp_replace(duration, '[^0-9]', '', 'g'), ''), '0')::INTEGER,
  ALTER COLUMN duration SET DEFAULT 30;
