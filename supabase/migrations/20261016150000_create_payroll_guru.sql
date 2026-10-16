-- Phase 2b: Payroll Guru ledger

CREATE TABLE IF NOT EXISTS public.payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_month DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paid')),
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    paid_at TIMESTAMPTZ,
    paid_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payroll_periods_month_first_day CHECK (EXTRACT(DAY FROM period_month) = 1),
    CONSTRAINT payroll_periods_status_timestamps CHECK (
        (status = 'open' AND closed_at IS NULL AND closed_by IS NULL AND paid_at IS NULL AND paid_by IS NULL)
        OR (status = 'closed' AND closed_at IS NOT NULL AND closed_by IS NOT NULL AND paid_at IS NULL AND paid_by IS NULL)
        OR (status = 'paid' AND closed_at IS NOT NULL AND closed_by IS NOT NULL AND paid_at IS NOT NULL AND paid_by IS NOT NULL)
    ),
    CONSTRAINT payroll_periods_month_unique UNIQUE (period_month)
);

CREATE TABLE IF NOT EXISTS public.payroll_session_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE RESTRICT,
    teaching_session_student_id UUID NOT NULL REFERENCES public.teaching_session_students(id) ON DELETE RESTRICT,
    teaching_session_id UUID NOT NULL REFERENCES public.teaching_sessions(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    session_date DATE NOT NULL,
    attendance_status TEXT NOT NULL CHECK (attendance_status IN ('present', 'absent', 'excused', 'cancelled')),
    teacher_fee_snapshot INTEGER NOT NULL CHECK (teacher_fee_snapshot >= 0),
    payable_amount INTEGER NOT NULL CHECK (payable_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payroll_session_lines_source_unique UNIQUE (teaching_session_student_id)
);

CREATE INDEX IF NOT EXISTS idx_payroll_session_lines_period_teacher_date
    ON public.payroll_session_lines (period_id, teacher_id, session_date);

CREATE TABLE IF NOT EXISTS public.payroll_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    fee_sessions_total INTEGER NOT NULL DEFAULT 0 CHECK (fee_sessions_total >= 0),
    fixed_allowances_total INTEGER NOT NULL DEFAULT 0 CHECK (fixed_allowances_total >= 0),
    minimum_income_snapshot INTEGER NOT NULL DEFAULT 0 CHECK (minimum_income_snapshot >= 0),
    allowances_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    adjustments_total INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payroll_entries_period_teacher_unique UNIQUE (period_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS public.payroll_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount INTEGER NOT NULL CHECK (amount <> 0),
    reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payroll_adjustments_period_teacher
    ON public.payroll_adjustments (period_id, teacher_id);

DROP TRIGGER IF EXISTS payroll_periods_updated_at ON public.payroll_periods;
CREATE TRIGGER payroll_periods_updated_at
    BEFORE UPDATE ON public.payroll_periods
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS payroll_entries_updated_at ON public.payroll_entries;
CREATE TRIGGER payroll_entries_updated_at
    BEFORE UPDATE ON public.payroll_entries
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_session_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages payroll periods"
    ON public.payroll_periods FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Guru reads payroll periods"
    ON public.payroll_periods FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.payroll_entries pe
            WHERE pe.period_id = id
              AND pe.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Admin manages payroll session lines"
    ON public.payroll_session_lines FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Guru reads own payroll session lines"
    ON public.payroll_session_lines FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Admin manages payroll entries"
    ON public.payroll_entries FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Guru reads own payroll entries"
    ON public.payroll_entries FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Admin manages payroll adjustments"
    ON public.payroll_adjustments FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Guru reads own payroll adjustments"
    ON public.payroll_adjustments FOR SELECT
    USING (teacher_id = auth.uid());

CREATE OR REPLACE FUNCTION public.close_payroll_period(
    p_period_id UUID
)
RETURNS public.payroll_periods
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_period public.payroll_periods%ROWTYPE;
BEGIN
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya admin yang dapat menutup periode payroll.' USING ERRCODE = 'P0001';
    END IF;

    SELECT *
    INTO v_period
    FROM public.payroll_periods
    WHERE id = p_period_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Periode payroll tidak ditemukan.' USING ERRCODE = 'P0001';
    END IF;

    IF v_period.status <> 'open' THEN
        RAISE EXCEPTION 'Periode payroll sudah tidak terbuka.' USING ERRCODE = 'P0001';
    END IF;

    INSERT INTO public.payroll_session_lines (
        period_id,
        teaching_session_student_id,
        teaching_session_id,
        teacher_id,
        student_id,
        session_date,
        attendance_status,
        teacher_fee_snapshot,
        payable_amount
    )
    SELECT
        v_period.id,
        tss.id,
        ts.id,
        ts.teacher_id,
        tss.student_id,
        ts.session_date,
        tss.attendance_status,
        tss.teacher_fee_snapshot,
        CASE WHEN tss.attendance_status = 'present' THEN tss.teacher_fee_snapshot ELSE 0 END
    FROM public.teaching_session_students tss
    JOIN public.teaching_sessions ts ON ts.id = tss.session_id
    WHERE ts.status = 'submitted'
      AND ts.session_date >= v_period.period_month
      AND ts.session_date < (v_period.period_month + INTERVAL '1 month')::DATE
    ON CONFLICT (teaching_session_student_id) DO NOTHING;

    INSERT INTO public.payroll_entries (
        period_id,
        teacher_id,
        fee_sessions_total,
        fixed_allowances_total,
        minimum_income_snapshot,
        allowances_snapshot,
        adjustments_total,
        total_amount
    )
    SELECT
        v_period.id,
        p.id,
        COALESCE(fees.total_fee, 0),
        COALESCE(allowances.total_allowance, 0),
        COALESCE(p.minimum_income, 0),
        COALESCE(p.allowances, '[]'::jsonb),
        COALESCE(adjustments.total_adjustment, 0),
        COALESCE(fees.total_fee, 0)
          + COALESCE(allowances.total_allowance, 0)
          + COALESCE(adjustments.total_adjustment, 0)
    FROM public.profiles p
    LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(psl.payable_amount), 0)::INTEGER AS total_fee
        FROM public.payroll_session_lines psl
        WHERE psl.period_id = v_period.id
          AND psl.teacher_id = p.id
    ) fees ON TRUE
    LEFT JOIN LATERAL (
        SELECT COALESCE(SUM((item->>'amount')::INTEGER), 0)::INTEGER AS total_allowance
        FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(p.allowances) = 'array' THEN p.allowances ELSE '[]'::jsonb END
        ) item
    ) allowances ON TRUE
    LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(pa.amount), 0)::INTEGER AS total_adjustment
        FROM public.payroll_adjustments pa
        WHERE pa.period_id = v_period.id
          AND pa.teacher_id = p.id
    ) adjustments ON TRUE
    WHERE p.role = 'guru'
      AND p.is_active = TRUE
    ON CONFLICT (period_id, teacher_id) DO UPDATE
    SET fee_sessions_total = EXCLUDED.fee_sessions_total,
        fixed_allowances_total = EXCLUDED.fixed_allowances_total,
        minimum_income_snapshot = EXCLUDED.minimum_income_snapshot,
        allowances_snapshot = EXCLUDED.allowances_snapshot,
        adjustments_total = EXCLUDED.adjustments_total,
        total_amount = EXCLUDED.total_amount,
        updated_at = now();

    UPDATE public.payroll_periods
    SET status = 'closed',
        closed_at = now(),
        closed_by = v_user_id,
        updated_at = now()
    WHERE id = v_period.id
    RETURNING * INTO v_period;

    RETURN v_period;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_payroll_period_paid(
    p_period_id UUID
)
RETURNS public.payroll_periods
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_period public.payroll_periods%ROWTYPE;
BEGIN
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya admin yang dapat menandai payroll sebagai dibayar.' USING ERRCODE = 'P0001';
    END IF;

    SELECT *
    INTO v_period
    FROM public.payroll_periods
    WHERE id = p_period_id
    FOR UPDATE;

    IF NOT FOUND OR v_period.status <> 'closed' THEN
        RAISE EXCEPTION 'Hanya periode payroll tertutup yang dapat dibayar.' USING ERRCODE = 'P0001';
    END IF;

    UPDATE public.payroll_periods
    SET status = 'paid',
        paid_at = now(),
        paid_by = v_user_id,
        updated_at = now()
    WHERE id = v_period.id
    RETURNING * INTO v_period;

    RETURN v_period;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_payroll_adjustment(
    p_period_id UUID,
    p_teacher_id UUID,
    p_amount INTEGER,
    p_reason TEXT
)
RETURNS public.payroll_adjustments
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_period public.payroll_periods%ROWTYPE;
    v_adjustment public.payroll_adjustments%ROWTYPE;
    v_adjustments_total INTEGER;
BEGIN
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya admin yang dapat menambah adjustment payroll.' USING ERRCODE = 'P0001';
    END IF;

    IF p_amount = 0 OR NULLIF(trim(p_reason), '') IS NULL THEN
        RAISE EXCEPTION 'Nominal dan alasan adjustment wajib diisi.' USING ERRCODE = 'P0001';
    END IF;

    SELECT *
    INTO v_period
    FROM public.payroll_periods
    WHERE id = p_period_id
    FOR UPDATE;

    IF NOT FOUND OR v_period.status <> 'closed' THEN
        RAISE EXCEPTION 'Adjustment hanya dapat ditambahkan pada periode tertutup sebelum dibayar.' USING ERRCODE = 'P0001';
    END IF;

    INSERT INTO public.payroll_adjustments (period_id, teacher_id, amount, reason, created_by)
    VALUES (p_period_id, p_teacher_id, p_amount, trim(p_reason), v_user_id)
    RETURNING * INTO v_adjustment;

    SELECT COALESCE(SUM(pa.amount), 0)::INTEGER
    INTO v_adjustments_total
    FROM public.payroll_adjustments pa
    WHERE pa.period_id = p_period_id
      AND pa.teacher_id = p_teacher_id;

    UPDATE public.payroll_entries pe
    SET adjustments_total = v_adjustments_total,
        total_amount = pe.fee_sessions_total + pe.fixed_allowances_total + v_adjustments_total,
        updated_at = now()
    WHERE pe.period_id = p_period_id
      AND pe.teacher_id = p_teacher_id;

    RETURN v_adjustment;
END;
$$;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_periods TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_session_lines TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_entries TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_adjustments TO authenticated, service_role;
GRANT SELECT ON public.payroll_periods TO anon;
GRANT SELECT ON public.payroll_session_lines TO anon;
GRANT SELECT ON public.payroll_entries TO anon;
GRANT SELECT ON public.payroll_adjustments TO anon;
GRANT EXECUTE ON FUNCTION public.close_payroll_period(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_payroll_period_paid(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_payroll_adjustment(UUID, UUID, INTEGER, TEXT) TO authenticated, service_role;
