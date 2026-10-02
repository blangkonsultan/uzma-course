-- 1. Program Variants Table
CREATE TABLE IF NOT EXISTS public.program_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 30, -- minutes
    system INTEGER NOT NULL DEFAULT 2,   -- max students per teacher
    teacher_fee INTEGER NOT NULL DEFAULT 3000, -- IDR fee per session
    default_spp INTEGER NOT NULL DEFAULT 150000, -- IDR default tuition
    sort_order INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_variants_program ON public.program_variants(program_id);

-- 2. Branch Shifts Table
CREATE TABLE IF NOT EXISTS public.branch_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branch_shifts_branch_day ON public.branch_shifts(branch_id, day_of_week);

-- 3. Profiles (Allowances and Bank Details)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
    ADD COLUMN IF NOT EXISTS allowance_transport INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS allowance_presence INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS allowance_creativity INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS allowance_education INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS morning_guarantee_threshold INTEGER NOT NULL DEFAULT 250000;

-- 4. Alter Student Programs (Add new columns without NOT NULL constraints first)
ALTER TABLE public.student_programs
    ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.program_variants(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS on_time_discount_type TEXT CHECK (on_time_discount_type IN ('none', 'nominal', 'percentage')) DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS on_time_discount_value INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cycle_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS cycle_days INTEGER NOT NULL DEFAULT 28;

-- 5. Data Backfill
DO $$
DECLARE
    prog RECORD;
    new_variant_id UUID;
BEGIN
    FOR prog IN SELECT id, name, duration, system FROM public.programs LOOP
        -- Generate a new UUID for the variant
        new_variant_id := gen_random_uuid();
        
        -- Insert a default variant for this program
        INSERT INTO public.program_variants (id, program_id, name, duration, system, teacher_fee, default_spp)
        VALUES (
            new_variant_id, 
            prog.id, 
            prog.name || ' Reguler', 
            COALESCE(prog.duration, 30), 
            COALESCE(prog.system, 2), 
            3000, 
            150000
        );

        -- Update existing student_programs to point to this new variant
        UPDATE public.student_programs 
        SET variant_id = new_variant_id, 
            spp_amount = CASE WHEN spp_amount = 0 THEN 150000 ELSE spp_amount END
        WHERE program_id = prog.id AND variant_id IS NULL;
    END LOOP;
END $$;

-- 6. Enforce NOT NULL on variant_id now that it is backfilled
ALTER TABLE public.student_programs
    ALTER COLUMN variant_id SET NOT NULL;
