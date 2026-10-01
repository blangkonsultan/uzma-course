-- Convert footer.content.socialLinks from object { instagram, facebook } to dynamic JSONB array
UPDATE public.landing_content
SET content = jsonb_set(
  content,
  '{socialLinks}',
  jsonb_build_array(
    jsonb_build_object(
      'platform', 'instagram',
      'label', 'Instagram',
      'url', COALESCE(content->'socialLinks'->>'instagram', 'https://www.instagram.com/ahesumokembangsri.ahejunwangi')
    ),
    jsonb_build_object(
      'platform', 'facebook',
      'label', 'Facebook',
      'url', COALESCE(content->'socialLinks'->>'facebook', 'https://www.facebook.com/share/1JKAhpJnPP/?mibextid=qi2Omg')
    )
  )
)
WHERE section = 'footer' AND jsonb_typeof(content->'socialLinks') = 'object';
