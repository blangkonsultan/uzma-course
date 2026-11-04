-- Migration: 20261104092000_book_minimum_income_topups.sql
-- Goal: Add kind column to payroll_adjustments ('manual' | 'minimum_income_topup'),
-- enforce positive amounts on automatic top-ups, partial unique index (period_id, teacher_id) WHERE kind = 'minimum_income_topup',
-- and book automatic top-up inside close_payroll_period atomically.

-- 1. Add kind column and constraints to payroll_adjustments
ALTER TABLE public.payroll_adjustments
ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'manual'
CHECK (kind IN ('manual', 'minimum_income_topup'));

-- Automatic top-ups must have positive amount
ALTER TABLE public.payroll_adjustments
DROP CONSTRAINT IF EXISTS chk_payroll_adjustments_positive_topup;

ALTER TABLE public.payroll_adjustments
ADD CONSTRAINT chk_payroll_adjustments_positive_topup
CHECK (kind <> 'minimum_income_topup' OR amount > 0);

-- Only one automatic top-up per teacher per period
CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_adjustments_period_teacher_topup
ON public.payroll_adjustments (period_id, teacher_id)
WHERE kind = 'minimum_income_topup';

-- 2. Update add_payroll_adjustment to explicitly set kind = 'manual'
CREATE OR REPLACE FUNCTION public.add_payroll_adjustment(
    p_period_id UUID,
    p_teacher_id UUID,
    p_amount INTEGER,
    p_reason TEXT
)
RETURNS public.payroll_adjustments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_period public.payroll_periods%ROWTYPE;
    v_adjustment public.payroll_adjustments%ROWTYPE;
    v_adjustments_total INTEGER;
BEGIN
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya admin yang dapat menambah adjustment payroll.' USING ERRCODE = '42501';
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

    INSERT INTO public.payroll_adjustments (period_id, teacher_id, amount, reason, created_by, kind)
    VALUES (p_period_id, p_teacher_id, p_amount, trim(p_reason), v_user_id, 'manual')
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

-- 3. Update close_payroll_period to atomically calculate and book automatic top-up
CREATE OR REPLACE FUNCTION public.close_payroll_period(
    p_period_id UUID
)
RETURNS public.payroll_periods
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_period public.payroll_periods%ROWTYPE;
    v_teacher RECORD;
    v_base INTEGER;
    v_topup INTEGER;
BEGIN
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya admin yang dapat menutup periode payroll.' USING ERRCODE = '42501';
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

    -- Snapshot teaching session student lines
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

    -- Capture teacher profile and fee snapshot into a temp table; ensure previous invocation temp table is dropped
    DROP TABLE IF EXISTS captured_teacher_snapshots;
    CREATE TEMP TABLE captured_teacher_snapshots AS
    SELECT
        p.id AS teacher_id,
        COALESCE(p.minimum_income, 0)::INTEGER AS min_income,
        COALESCE(p.allowances, '[]'::jsonb) AS allowances_json,
        COALESCE(fees.total_fee, 0)::INTEGER AS total_fee,
        COALESCE(allowances.total_allowance, 0)::INTEGER AS total_allowance
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
    WHERE p.role = 'guru'
      AND (p.is_active = TRUE OR fees.total_fee > 0);

    -- Insert automatic minimum-income topup if base < min_income
    FOR v_teacher IN SELECT * FROM captured_teacher_snapshots LOOP
        v_base := v_teacher.total_fee + v_teacher.total_allowance;
        IF v_teacher.min_income > 0 AND v_base < v_teacher.min_income THEN
            v_topup := v_teacher.min_income - v_base;
            INSERT INTO public.payroll_adjustments (
                period_id,
                teacher_id,
                amount,
                reason,
                created_by,
                kind
            ) VALUES (
                v_period.id,
                v_teacher.teacher_id,
                v_topup,
                'Top-up Garansi Gaji Minimum',
                v_user_id,
                'minimum_income_topup'
            )
            ON CONFLICT (period_id, teacher_id) WHERE kind = 'minimum_income_topup' DO NOTHING;
        END IF;
    END LOOP;

    -- Create or update payroll entries using the SAME captured snapshot
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
        cts.teacher_id,
        cts.total_fee,
        cts.total_allowance,
        cts.min_income,
        cts.allowances_json,
        COALESCE(adjustments.total_adjustment, 0),
        cts.total_fee + cts.total_allowance + COALESCE(adjustments.total_adjustment, 0)
    FROM captured_teacher_snapshots cts
    LEFT JOIN LATERAL (
        SELECT COALESCE(SUM(pa.amount), 0)::INTEGER AS total_adjustment
        FROM public.payroll_adjustments pa
        WHERE pa.period_id = v_period.id
          AND pa.teacher_id = cts.teacher_id
    ) adjustments ON TRUE
    ON CONFLICT (period_id, teacher_id) DO UPDATE
    SET fee_sessions_total = EXCLUDED.fee_sessions_total,
        fixed_allowances_total = EXCLUDED.fixed_allowances_total,
        minimum_income_snapshot = EXCLUDED.minimum_income_snapshot,
        allowances_snapshot = EXCLUDED.allowances_snapshot,
        adjustments_total = EXCLUDED.adjustments_total,
        total_amount = EXCLUDED.total_amount,
        updated_at = now();

    -- Close the period
    UPDATE public.payroll_periods
    SET status = 'closed',
        closed_at = now(),
        closed_by = v_user_id,
        updated_at = now()
    WHERE id = v_period.id
    RETURNING * INTO v_period;
    DROP TABLE IF EXISTS captured_teacher_snapshots;
    RETURN v_period;
END;
$$;

-- 4. Secure privileges
-- Revoke direct DML on payroll_adjustments from application roles to protect ledger integrity
REVOKE INSERT, UPDATE, DELETE ON public.payroll_adjustments FROM authenticated, anon, PUBLIC;

REVOKE EXECUTE ON FUNCTION public.close_payroll_period(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.add_payroll_adjustment(UUID, UUID, INTEGER, TEXT) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.close_payroll_period(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_payroll_adjustment(UUID, UUID, INTEGER, TEXT) TO authenticated, service_role;
