-- Phase 1 Security Hardening: Fix S1 (Signup Metadata Escalation) and S2 (Master Data Tables RLS)

-- 1. Hardcode self-registration role to 'guru', ignoring caller-supplied metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Guru'),
    'guru' -- Strictly ignore raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS on program_variants
ALTER TABLE public.program_variants ENABLE ROW LEVEL SECURITY;

-- Revoke default public/anon mutations
REVOKE ALL ON public.program_variants FROM anon;
GRANT SELECT ON public.program_variants TO anon;
GRANT SELECT ON public.program_variants TO authenticated;

-- Policies for program_variants
DROP POLICY IF EXISTS "Admins manage program variants" ON public.program_variants;
CREATE POLICY "Admins manage program variants"
  ON public.program_variants FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public reads active program variants" ON public.program_variants;
CREATE POLICY "Public reads active program variants"
  ON public.program_variants FOR SELECT
  USING (is_active = true);

-- 3. Enable RLS on branch_shifts
ALTER TABLE public.branch_shifts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.branch_shifts FROM anon;
REVOKE ALL ON public.branch_shifts FROM authenticated;
GRANT SELECT ON public.branch_shifts TO authenticated;

-- Policies for branch_shifts
DROP POLICY IF EXISTS "Admins manage branch shifts" ON public.branch_shifts;
CREATE POLICY "Admins manage branch shifts"
  ON public.branch_shifts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users read active branch shifts" ON public.branch_shifts;
CREATE POLICY "Authenticated users read active branch shifts"
  ON public.branch_shifts FOR SELECT
  TO authenticated
  USING (is_active = true);
