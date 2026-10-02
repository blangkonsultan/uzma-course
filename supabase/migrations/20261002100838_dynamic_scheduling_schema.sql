-- 1. Modify existing branch_shifts to be Master Time Slots (Columns)
-- Removing day_of_week because shift time slots are reusable across days.
ALTER TABLE public.branch_shifts DROP COLUMN IF EXISTS day_of_week;

-- 2. Create schedule_drafts (The Version/Trigger)
CREATE TABLE IF NOT EXISTS public.schedule_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    effective_date DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_schedule_drafts_branch ON public.schedule_drafts(branch_id);

-- 3. Create schedule_classes (The Container: Teacher + Variant)
CREATE TABLE IF NOT EXISTS public.schedule_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES public.schedule_drafts(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES public.branch_shifts(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    variant_id UUID NOT NULL REFERENCES public.program_variants(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- A teacher cannot be scheduled twice in the same shift on the same day for the same draft
    CONSTRAINT uq_teacher_shift_day UNIQUE (draft_id, shift_id, day_of_week, teacher_id)
);
CREATE INDEX IF NOT EXISTS idx_schedule_classes_draft ON public.schedule_classes(draft_id);

-- 4. Create schedule_placements (The Students assigned to the container)
CREATE TABLE IF NOT EXISTS public.schedule_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.schedule_classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- A student cannot be placed twice in the same class container
    CONSTRAINT uq_student_class UNIQUE (class_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_schedule_placements_class ON public.schedule_placements(class_id);

-- Enable RLS
ALTER TABLE public.schedule_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_placements ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin full access)
CREATE POLICY "Admin manages schedule_drafts" ON public.schedule_drafts FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manages schedule_classes" ON public.schedule_classes FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manages schedule_placements" ON public.schedule_placements FOR ALL USING (public.is_admin());

-- Guru Read Access
CREATE POLICY "Guru reads active drafts" ON public.schedule_drafts FOR SELECT USING (
    status = 'active' AND branch_id IN (SELECT branch_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "Guru reads their classes" ON public.schedule_classes FOR SELECT USING (
    teacher_id = auth.uid() OR public.is_admin()
);
CREATE POLICY "Guru reads their student placements" ON public.schedule_placements FOR SELECT USING (
    class_id IN (SELECT id FROM public.schedule_classes WHERE teacher_id = auth.uid()) OR public.is_admin()
);

-- Updated_at triggers
CREATE TRIGGER schedule_drafts_updated_at BEFORE UPDATE ON public.schedule_drafts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER schedule_classes_updated_at BEFORE UPDATE ON public.schedule_classes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ==============================================================================
-- DUMMY SEEDER DATA FOR TESTING (Can be truncated later)
-- ==============================================================================
DO $$
DECLARE
    dummy_teacher_id UUID;
    dummy_student_id UUID;
    i INTEGER;
    j INTEGER;
BEGIN
    -- 1. Create 5 Dummy Teachers for Balongbendo
    FOR i IN 1..5 LOOP
        dummy_teacher_id := gen_random_uuid();
        
        -- Bypass auth trigger manually by inserting directly into auth.users (simplification for dummy data, usually done via admin API)
        -- To avoid breaking auth constraints in dummy script without auth.users access, we will use existing teachers if they exist, or just insert into profiles with fake UUIDs (violates FK to auth.users if not careful, but profiles has CASCADE).
        -- Actually, profiles references auth.users(id). We cannot easily seed profiles without auth.users.
        -- Let's use a workaround: Insert into auth.users first.
        INSERT INTO auth.users (id, email, raw_user_meta_data)
        VALUES (dummy_teacher_id, 'dummy_guru_' || i || '@test.com', jsonb_build_object('full_name', 'Guru Dummy ' || i, 'role', 'guru'));
        
        -- Trigger creates profile, we just need to update it
        UPDATE public.profiles 
        SET branch_id = 'balongbendo', 
            full_name = 'Guru Dummy ' || i
        WHERE id = dummy_teacher_id;
    END LOOP;

    -- 2. Create 20 Dummy Students for Balongbendo
    FOR j IN 1..20 LOOP
        INSERT INTO public.students (
            full_name, parent_name, parent_phone, branch_id
        ) VALUES (
            'Murid Dummy ' || j, 'Ortu Dummy ' || j, '0812345678' || j, 'balongbendo'
        ) RETURNING id INTO dummy_student_id;
        
        -- Enroll them in AHE (system: 2) or BEE (system: 5)
        -- We'll assume the first variant found is fine for testing
        INSERT INTO public.student_programs (student_id, program_id, variant_id, spp_amount)
        SELECT dummy_student_id, p.id, pv.id, 150000
        FROM public.programs p
        JOIN public.program_variants pv ON pv.program_id = p.id
        LIMIT 1;
    END LOOP;
END $$;
