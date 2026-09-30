-- Migration: Add founder photo fallback to team landing content
-- Date: 2026-09-30

UPDATE public.landing_content
SET content = jsonb_set(
  jsonb_set(
    content,
    '{founderPhotoUrl}',
    to_jsonb('/images/founder-fallback.webp'::text),
    true
  ),
  '{founderPhotoAlt}',
  to_jsonb('Foto Profil Nurul Ilmi Mega Puspita, S.Pd. - Pengelola Uzma Course'::text),
  true
)
WHERE section = 'team'
  AND (content->>'founderPhotoUrl' IS NULL OR content->>'founderPhotoUrl' = '');
