-- Phase 3: Add shift_id to teacher_attendances for per-shift attendance support
ALTER TABLE public.teacher_attendances
    ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.branch_shifts(id) ON DELETE SET NULL;

-- Composite index for quick session queries
CREATE INDEX IF NOT EXISTS idx_teacher_attendances_session
    ON public.teacher_attendances(teacher_id, branch_id, shift_id, check_in_time);
