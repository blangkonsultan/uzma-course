CREATE TABLE IF NOT EXISTS public.profile_branches (
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (profile_id, branch_id)
);

-- Enable RLS
ALTER TABLE public.profile_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read branch assignments"
    ON public.profile_branches FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin manages branch assignments"
    ON public.profile_branches
    USING (public.is_admin());

-- Backfill existing teacher branches
INSERT INTO public.profile_branches (profile_id, branch_id, is_primary)
SELECT id, branch_id, true
FROM public.profiles
WHERE branch_id IS NOT NULL AND role = 'guru'
ON CONFLICT (profile_id, branch_id) DO NOTHING;
