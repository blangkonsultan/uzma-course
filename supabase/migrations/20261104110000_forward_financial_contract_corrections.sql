-- Forward-only RPC corrections for deployments that already recorded the three 20261104 migrations.
-- Historical migration files retain their exact creation-commit bytes. No history is backfilled.

-- Migration: 20261104090000_harden_billing_rpc_authorization.sql
-- Goal: Hardens authorization boundaries for generate_due_student_invoices and record_student_payment
-- Reject auth.uid() IS NULL OR NOT public.is_admin() with SQLSTATE 42501 before any reads, locks, or side effects.
-- Revoke EXECUTE from PUBLIC and anon; grant only authenticated and service_role.

-- 1. Replace generate_due_student_invoices
CREATE OR REPLACE FUNCTION public.generate_due_student_invoices(p_branch_id TEXT DEFAULT NULL)
RETURNS SETOF public.student_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_rec RECORD;
    v_cycle_days INTEGER;
    v_start_date DATE;
    v_end_date DATE;
    v_due_date DATE;
    v_cycle_num INTEGER;
    v_days_diff INTEGER;
    v_discount INTEGER;
    v_total INTEGER;
    v_yymm TEXT;
    v_next_seq INTEGER;
    v_invoice_num TEXT;
    v_new_invoice public.student_invoices;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya admin yang dapat menerbitkan tagihan SPP.' USING ERRCODE = '42501';
    END IF;

    -- Format YYMM in Asia/Jakarta
    v_yymm := to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta', 'YYMM');
    FOR v_rec IN
        SELECT sp.student_id,
               sp.program_id,
               sp.variant_id,
               sp.spp_amount,
               COALESCE(sp.cycle_start_date, CURRENT_DATE) AS cycle_start_date,
               COALESCE(sp.cycle_days, 28) AS cycle_days,
               COALESCE(sp.on_time_discount_type, 'none') AS discount_type,
               COALESCE(sp.on_time_discount_value, 0) AS discount_value,
               st.branch_id
        FROM public.student_programs sp
        JOIN public.students st ON st.id = sp.student_id
        WHERE sp.status = 'active'
          AND st.is_active = TRUE
          AND (p_branch_id IS NULL OR st.branch_id = p_branch_id)
        ORDER BY sp.student_id, sp.program_id
    LOOP
        v_cycle_days := GREATEST(1, v_rec.cycle_days);

        -- Calculate current cycle based on cycle_start_date
        v_days_diff := GREATEST(0, (CURRENT_DATE - v_rec.cycle_start_date));
        v_cycle_num := (v_days_diff / v_cycle_days) + 1;

        v_start_date := v_rec.cycle_start_date + ((v_cycle_num - 1) * v_cycle_days);
        v_end_date := v_start_date + (v_cycle_days - 1);
        v_due_date := v_start_date + 7;

        -- Only generate if invoice for this exact (student, program, period_start) doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM public.student_invoices
            WHERE student_id = v_rec.student_id
              AND program_id = v_rec.program_id
              AND period_start = v_start_date
        ) THEN
            -- Calculate discount
            v_discount := 0;
            IF v_rec.discount_type = 'nominal' AND v_rec.discount_value > 0 THEN
                v_discount := LEAST(v_rec.spp_amount::INTEGER, v_rec.discount_value);
            ELSIF v_rec.discount_type = 'percentage' AND v_rec.discount_value > 0 THEN
                v_discount := LEAST(v_rec.spp_amount::INTEGER, ROUND((v_rec.spp_amount * v_rec.discount_value) / 100.0)::INTEGER);
            END IF;

            v_total := GREATEST(0, v_rec.spp_amount::INTEGER - v_discount);

            -- Next sequential invoice number in current month
            SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 10 FOR 4)::INTEGER), 0) + 1
            INTO v_next_seq
            FROM public.student_invoices
            WHERE invoice_number LIKE 'INV-' || v_yymm || '-%';

            v_invoice_num := 'INV-' || v_yymm || '-' || LPAD(v_next_seq::TEXT, 4, '0');

            INSERT INTO public.student_invoices (
                invoice_number,
                student_id,
                program_id,
                variant_id,
                branch_id,
                period_start,
                period_end,
                due_date,
                cycle_number,
                amount,
                discount_amount,
                total_amount,
                status,
                created_by
            ) VALUES (
                v_invoice_num,
                v_rec.student_id,
                v_rec.program_id,
                v_rec.variant_id,
                v_rec.branch_id,
                v_start_date,
                v_end_date,
                v_due_date,
                v_cycle_num,
                v_rec.spp_amount,
                v_discount,
                v_total,
                'unpaid',
                v_user_id
            )
            RETURNING * INTO v_new_invoice;

            RETURN NEXT v_new_invoice;
        END IF;
    END LOOP;

    RETURN;
END;
$$;

-- 2. Replace record_student_payment
CREATE OR REPLACE FUNCTION public.record_student_payment(
    p_invoice_id UUID,
    p_payment_method TEXT,
    p_payment_date DATE DEFAULT CURRENT_DATE,
    p_payment_reference TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS public.student_payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_invoice public.student_invoices;
    v_yymm TEXT;
    v_next_seq INTEGER;
    v_receipt_num TEXT;
    v_payment public.student_payments;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya admin yang dapat mencatat pembayaran SPP.' USING ERRCODE = '42501';
    END IF;

    -- Validate payment method
    IF p_payment_method NOT IN ('cash', 'transfer_bca', 'transfer_bri', 'transfer_mandiri', 'qris', 'other') THEN
        RAISE EXCEPTION 'Metode pembayaran tidak valid.' USING ERRCODE = 'P0002';
    END IF;

    -- Lock invoice for update
    SELECT * INTO v_invoice
    FROM public.student_invoices
    WHERE id = p_invoice_id
    FOR UPDATE;

    IF v_invoice.id IS NULL THEN
        RAISE EXCEPTION 'Tagihan SPP tidak ditemukan.' USING ERRCODE = 'P0003';
    END IF;

    IF v_invoice.status <> 'unpaid' THEN
        RAISE EXCEPTION 'Hanya tagihan berstatus belum lunas yang dapat dibayarkan.' USING ERRCODE = 'P0004';
    END IF;

    -- Generate receipt number RCT-YYMM-NNNN
    v_yymm := to_char(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta', 'YYMM');

    SELECT COALESCE(MAX(SUBSTRING(receipt_number FROM 10 FOR 4)::INTEGER), 0) + 1
    INTO v_next_seq
    FROM public.student_payments
    WHERE receipt_number LIKE 'RCT-' || v_yymm || '-%';

    v_receipt_num := 'RCT-' || v_yymm || '-' || LPAD(v_next_seq::TEXT, 4, '0');

    -- Insert payment record with verified admin UID
    INSERT INTO public.student_payments (
        receipt_number,
        invoice_id,
        student_id,
        amount_paid,
        payment_date,
        payment_method,
        payment_reference,
        received_by,
        notes
    ) VALUES (
        v_receipt_num,
        v_invoice.id,
        v_invoice.student_id,
        v_invoice.total_amount,
        COALESCE(p_payment_date, CURRENT_DATE),
        p_payment_method,
        p_payment_reference,
        v_user_id,
        p_notes
    )
    RETURNING * INTO v_payment;

    -- Update invoice to paid
    UPDATE public.student_invoices
    SET status = 'paid',
        updated_at = now()
    WHERE id = p_invoice_id;

    RETURN v_payment;
END;
$$;

-- 3. Revoke EXECUTE from PUBLIC and anon; grant only authenticated and service_role
REVOKE EXECUTE ON FUNCTION public.generate_due_student_invoices(TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_student_payment(UUID, TEXT, DATE, TEXT, TEXT) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.generate_due_student_invoices(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_student_payment(UUID, TEXT, DATE, TEXT, TEXT) TO authenticated, service_role;

-- Migration: 20261104091000_authorize_teacher_overdue_summaries.sql
-- Goal: Revoke broad teacher SELECT policies on student_invoices and student_payments (SEC-02),
-- provide get_teacher_overdue_spp(p_class_ids uuid[]) RPC for aggregate past-due debt by active class,
-- and get_teacher_class_students(p_class_ids uuid[]) for minimal roster access.

-- 1. Drop broad teacher SELECT policies on student_invoices and student_payments
DROP POLICY IF EXISTS "Guru reads branch student_invoices" ON public.student_invoices;
DROP POLICY IF EXISTS "Guru reads branch student_payments" ON public.student_payments;

-- 2. Create get_teacher_overdue_spp RPC
-- Aggregates past-due unpaid invoices inside PostgreSQL for active classes owned by auth.uid().
CREATE OR REPLACE FUNCTION public.get_teacher_overdue_spp(p_class_ids UUID[])
RETURNS TABLE(
    class_id UUID,
    student_id UUID,
    program_id UUID,
    due_date DATE,
    total_amount BIGINT,
    invoice_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_today DATE;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = v_user_id AND role = 'guru'
    ) THEN
        RAISE EXCEPTION 'Hanya guru terautentikasi yang dapat mengakses ringkasan SPP murid.' USING ERRCODE = '42501';
    END IF;

    IF p_class_ids IS NULL OR array_length(p_class_ids, 1) = 0 THEN
        RETURN;
    END IF;

    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE;

    RETURN QUERY
    WITH requested_classes AS (
        SELECT DISTINCT unnest(p_class_ids) AS req_class_id
    ),
    authorized_pairs AS (
        SELECT DISTINCT
            sc.id AS auth_class_id,
            sp.student_id AS auth_student_id,
            pv.program_id AS auth_program_id
        FROM requested_classes rc
        JOIN public.schedule_classes sc ON sc.id = rc.req_class_id
        JOIN public.schedule_drafts sd ON sd.id = sc.draft_id
        JOIN public.program_variants pv ON pv.id = sc.variant_id
        JOIN public.schedule_placements sp ON sp.class_id = sc.id
        WHERE sc.teacher_id = v_user_id
          AND sd.status = 'active'
    )
    SELECT
        ap.auth_class_id AS class_id,
        ap.auth_student_id AS student_id,
        ap.auth_program_id AS program_id,
        MIN(inv.due_date) AS due_date,
        COALESCE(SUM(inv.total_amount), 0)::BIGINT AS total_amount,
        COUNT(inv.id)::BIGINT AS invoice_count
    FROM authorized_pairs ap
    JOIN public.student_invoices inv
      ON inv.student_id = ap.auth_student_id
     AND inv.program_id = ap.auth_program_id
     AND inv.status = 'unpaid'
     AND inv.due_date < v_today
    GROUP BY ap.auth_class_id, ap.auth_student_id, ap.auth_program_id
    ORDER BY ap.auth_class_id, ap.auth_student_id, ap.auth_program_id;
END;
$$;

-- 3. Create get_teacher_class_students RPC
-- Minimal roster read for owned classes (active or historical).
CREATE OR REPLACE FUNCTION public.get_teacher_class_students(p_class_ids UUID[])
RETURNS TABLE(
    class_id UUID,
    student_id UUID,
    full_name TEXT,
    student_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = v_user_id AND role = 'guru'
    ) THEN
        RAISE EXCEPTION 'Hanya guru terautentikasi yang dapat mengakses data murid kelas.' USING ERRCODE = '42501';
    END IF;

    IF p_class_ids IS NULL OR array_length(p_class_ids, 1) = 0 THEN
        RETURN;
    END IF;

    RETURN QUERY
    WITH requested_classes AS (
        SELECT DISTINCT unnest(p_class_ids) AS req_class_id
    ),
    authorized_classes AS (
        SELECT sc.id AS auth_class_id
        FROM requested_classes rc
        JOIN public.schedule_classes sc ON sc.id = rc.req_class_id
        WHERE sc.teacher_id = v_user_id
    )
    SELECT DISTINCT
        ac.auth_class_id AS class_id,
        s.id AS student_id,
        s.full_name::TEXT,
        s.student_number::TEXT
    FROM authorized_classes ac
    JOIN public.schedule_placements sp ON sp.class_id = ac.auth_class_id
    JOIN public.students s ON s.id = sp.student_id
    ORDER BY ac.auth_class_id, s.id;
END;
$$;

-- 4. Revoke EXECUTE from PUBLIC and anon; grant only authenticated and service_role
REVOKE EXECUTE ON FUNCTION public.get_teacher_overdue_spp(UUID[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_teacher_class_students(UUID[]) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_teacher_overdue_spp(UUID[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_teacher_class_students(UUID[]) TO authenticated, service_role;

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
    -- Ensure payroll entry exists for this teacher in this closed period
    UPDATE public.payroll_entries pe
    SET adjustments_total = v_adjustments_total,
        total_amount = pe.fee_sessions_total + pe.fixed_allowances_total + v_adjustments_total,
        updated_at = now()
    WHERE pe.period_id = p_period_id
      AND pe.teacher_id = p_teacher_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guru tidak memiliki entri payroll pada periode ini.' USING ERRCODE = 'P0002';
    END IF;
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
    DROP TABLE IF EXISTS pg_temp.captured_teacher_snapshots;
    CREATE TEMP TABLE pg_temp.captured_teacher_snapshots ON COMMIT DROP AS
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
    FOR v_teacher IN SELECT * FROM pg_temp.captured_teacher_snapshots LOOP
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
            );
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
    FROM pg_temp.captured_teacher_snapshots cts
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
    DROP TABLE IF EXISTS pg_temp.captured_teacher_snapshots;
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
