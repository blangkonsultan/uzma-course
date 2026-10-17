-- Phase 2b: Student Billing & SPP Invoicing Ledger
-- 1. Student Invoices (Piutang SPP Murid)
CREATE TABLE IF NOT EXISTS public.student_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT,
    variant_id UUID NOT NULL REFERENCES public.program_variants(id) ON DELETE RESTRICT,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    cycle_number INTEGER NOT NULL DEFAULT 1 CHECK (cycle_number >= 1),
    amount INTEGER NOT NULL CHECK (amount >= 0),
    discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id),
    CONSTRAINT uq_student_program_period UNIQUE (student_id, program_id, period_start)
);

-- 2. Student Payments (Penerimaan Kas Masuk / Kwitansi Resmi)
CREATE TABLE IF NOT EXISTS public.student_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT NOT NULL UNIQUE,
    invoice_id UUID NOT NULL UNIQUE REFERENCES public.student_invoices(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    amount_paid INTEGER NOT NULL CHECK (amount_paid > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer_bca', 'transfer_bri', 'transfer_mandiri', 'qris', 'other')),
    payment_reference TEXT,
    received_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_student_invoices_student ON public.student_invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_student_invoices_branch_status ON public.student_invoices(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_student_invoices_period_start ON public.student_invoices(period_start);
CREATE INDEX IF NOT EXISTS idx_student_payments_invoice ON public.student_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_student_payments_student ON public.student_payments(student_id);

-- Auto-update updated_at on invoices
CREATE TRIGGER student_invoices_updated_at
    BEFORE UPDATE ON public.student_invoices
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Row Level Security (RLS)
ALTER TABLE public.student_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages student_invoices"
    ON public.student_invoices FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Guru reads branch student_invoices"
    ON public.student_invoices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles pr
            WHERE pr.id = auth.uid()
              AND pr.role = 'guru'
              AND pr.branch_id = student_invoices.branch_id
        )
    );

CREATE POLICY "Admin manages student_payments"
    ON public.student_payments FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Guru reads branch student_payments"
    ON public.student_payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.student_invoices inv
            JOIN public.profiles pr ON pr.id = auth.uid()
            WHERE inv.id = student_payments.invoice_id
              AND pr.role = 'guru'
              AND pr.branch_id = inv.branch_id
        )
    );

-- 4. Stored Procedure: Generate Due Student Invoices (Idempotent Rolling 28-Day Cycle)
CREATE OR REPLACE FUNCTION public.generate_due_student_invoices(p_branch_id UUID DEFAULT NULL)
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
    IF v_user_id IS NOT NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya admin yang dapat menerbitkan tagihan SPP.';
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
          AND st.status = 'active'
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
                v_rec.spp_amount::INTEGER,
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

-- 5. Stored Procedure: Record Student Payment & Issue Official Receipt
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
    IF v_user_id IS NOT NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Hanya admin yang dapat mencatat pembayaran SPP.' USING ERRCODE = 'P0001';
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

    -- Insert payment record
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
        COALESCE(v_user_id, v_invoice.student_id),
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

-- 6. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_invoices TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_payments TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_due_student_invoices(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_student_payment(UUID, TEXT, DATE, TEXT, TEXT) TO authenticated, service_role;
