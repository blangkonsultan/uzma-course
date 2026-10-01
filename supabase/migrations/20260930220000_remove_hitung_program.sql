-- Migration: Remove hitung program (replaced by ase) and deduplicate arrays
-- Also removes hitung from landing_content programs section

-- Replace 'hitung' with 'ase' in students.programs, then deduplicate
UPDATE public.students
SET programs = (
  SELECT array_agg(DISTINCT val ORDER BY val)
  FROM unnest(
    array_replace(programs, 'hitung', 'ase')
  ) AS val
)
WHERE 'hitung' = ANY(programs);

-- Same for profiles.programs
UPDATE public.profiles
SET programs = (
  SELECT array_agg(DISTINCT val ORDER BY val)
  FROM unnest(
    array_replace(programs, 'hitung', 'ase')
  ) AS val
)
WHERE programs IS NOT NULL AND 'hitung' = ANY(programs);

-- Remove 'hitung' from landing_content JSONB
UPDATE public.landing_content
SET content = jsonb_set(
  content,
  '{items}',
  (
    SELECT coalesce(jsonb_agg(item), '[]'::jsonb)
    FROM jsonb_array_elements(content->'items') AS item
    WHERE item->>'id' != 'hitung'
  )
)
WHERE section = 'programs'
  AND content->'items' IS NOT NULL;
