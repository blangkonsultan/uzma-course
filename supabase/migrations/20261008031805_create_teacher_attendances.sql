CREATE TABLE IF NOT EXISTS public.teacher_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL,
    check_out_time TIMESTAMPTZ,
    check_in_lat FLOAT8,
    check_in_lng FLOAT8,
    check_out_lat FLOAT8,
    check_out_lng FLOAT8,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teacher_attendances ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin manages all attendances"
    ON public.teacher_attendances
    USING (public.is_admin());

CREATE POLICY "Guru reads own attendances"
    ON public.teacher_attendances FOR SELECT
    USING (auth.uid() = teacher_id);

CREATE POLICY "Guru inserts own attendances"
    ON public.teacher_attendances FOR INSERT
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Guru updates own attendances"
    ON public.teacher_attendances FOR UPDATE
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);
