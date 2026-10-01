-- Create storage bucket for program logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'program-logos',
  'program-logos',
  true,
  524288,  -- 512 KB max
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access (logos are displayed on the landing page)
CREATE POLICY "Public read program logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'program-logos');

-- Admin-only upload/update/delete
CREATE POLICY "Admin manages program logos"
  ON storage.objects FOR ALL
  USING (bucket_id = 'program-logos' AND public.is_admin())
  WITH CHECK (bucket_id = 'program-logos' AND public.is_admin());
