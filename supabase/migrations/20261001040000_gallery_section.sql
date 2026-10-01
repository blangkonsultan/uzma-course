-- Migrate gallery data from team section to standalone gallery section
-- Extract galleryImageUrl/Alt/Caption from team JSONB -> create gallery section row
-- Then remove gallery fields from team section

-- 1. Insert gallery section with migrated single image from team (if team row exists)
INSERT INTO public.landing_content (section, content)
SELECT
  'gallery',
  jsonb_build_object(
    'title', 'Galeri',
    'subtitle', 'Dokumentasi kegiatan belajar, wisuda, dan lisensi di Uzma Course',
    'groups', jsonb_build_array(
      jsonb_build_object('label', 'Lisensi', 'images', '[]'::jsonb),
      jsonb_build_object('label', 'Wisuda', 'images', '[]'::jsonb),
      jsonb_build_object(
        'label', 'Kegiatan Guru dan Murid',
        'images',
        CASE
          WHEN team.content->>'galleryImageUrl' IS NOT NULL
               AND team.content->>'galleryImageUrl' != ''
          THEN jsonb_build_array(
            jsonb_build_object(
              'url', team.content->>'galleryImageUrl',
              'alt', COALESCE(team.content->>'galleryImageAlt', '')
            )
          )
          ELSE '[]'::jsonb
        END
      )
    )
  )
FROM public.landing_content team
WHERE team.section = 'team'
ON CONFLICT (section) DO NOTHING;

-- 2. Fallback insert if team row did not exist
INSERT INTO public.landing_content (section, content)
VALUES (
  'gallery',
  jsonb_build_object(
    'title', 'Galeri',
    'subtitle', 'Dokumentasi kegiatan belajar, wisuda, dan lisensi di Uzma Course',
    'groups', jsonb_build_array(
      jsonb_build_object('label', 'Lisensi', 'images', '[]'::jsonb),
      jsonb_build_object('label', 'Wisuda', 'images', '[]'::jsonb),
      jsonb_build_object('label', 'Kegiatan Guru dan Murid', 'images', '[]'::jsonb)
    )
  )
)
ON CONFLICT (section) DO NOTHING;

-- 3. Remove gallery fields from team section content
UPDATE public.landing_content
SET content = content - 'galleryImageUrl' - 'galleryImageAlt' - 'galleryCaption'
WHERE section = 'team';
