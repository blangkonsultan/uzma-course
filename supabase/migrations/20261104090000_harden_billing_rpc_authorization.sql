-- Migration: 20261104090000_harden_billing_rpc_authorization.sql
-- Goal: Hardens authorization boundaries for generate_due_student_invoices and record_student_payment
-- Reject auth.uid() IS NULL OR NOT public.is_admin() with SQLSTATE 42501 before any reads, locks, or side effects.
-- Revoke EXECUTE from PUBLIC and anon; grant only authenticated and service_role.

-- 1. Replace generate_due_student_invoices
CREATE OR REPLACE FUNCTION public.generate_due_student_invoices(p_branch_id TEXT DEFAULT NULL)
RETURNS SETOF public.student_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
SET search_path = public
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
