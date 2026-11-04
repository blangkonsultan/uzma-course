-- scripts/sql/payroll-minimum-contracts.sql
-- Suite: payroll-minimum
-- Tests PAY-01: Automatic minimum-income adjustment inside close_payroll_period

DO $$
DECLARE
    v_admin_id UUID;
    v_teacher_id UUID;
    v_period_id UUID;
    v_period_row public.payroll_periods;
    v_adj_row public.payroll_adjustments;
    v_entry_row public.payroll_entries;
    v_count INTEGER;
BEGIN
    SELECT id INTO v_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Prerequisite failed: admin profile missing';
    END IF;

    -- Pick a guru to test
    SELECT id INTO v_teacher_id FROM public.profiles WHERE role = 'guru' LIMIT 1;
    IF v_teacher_id IS NULL THEN
        RAISE EXCEPTION 'Prerequisite failed: guru profile missing';
    END IF;

    -- Set fixed allowance Rp400,000 and minimum income Rp450,000
    UPDATE public.profiles
    SET allowances = '[{"name": "Tunjangan Tetap", "amount": 400000}]'::jsonb,
        minimum_income = 450000,
        is_active = TRUE
    WHERE id = v_teacher_id;

    -- Create disposable open period
    INSERT INTO public.payroll_periods (period_month, status)
    VALUES ('1999-01-01', 'open')
    RETURNING id INTO v_period_id;

    -- Act: Close payroll period as admin
    PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

    v_period_row := public.close_payroll_period(v_period_id);
    ASSERT v_period_row.status = 'closed', 'close_payroll_period did not set status to closed';

    -- Check automatic adjustment: shortfall 400,000 to 450,000 -> 50,000
    SELECT * INTO v_adj_row
    FROM public.payroll_adjustments
    WHERE period_id = v_period_id
      AND teacher_id = v_teacher_id
      AND kind = 'minimum_income_topup';

    ASSERT v_adj_row.id IS NOT NULL, 'automatic minimum_income_topup adjustment row not found';
    ASSERT v_adj_row.amount = 50000, format('expected automatic top-up 50000, got %s', v_adj_row.amount);
    ASSERT v_adj_row.reason = 'Top-up Garansi Gaji Minimum', format('expected Top-up Garansi Gaji Minimum, got %s', v_adj_row.reason);

    -- Check payroll entry total
    SELECT * INTO v_entry_row
    FROM public.payroll_entries
    WHERE period_id = v_period_id
      AND teacher_id = v_teacher_id;

    ASSERT v_entry_row.total_amount = 450000, format('expected total_amount 450000, got %s', v_entry_row.total_amount);
    ASSERT v_entry_row.adjustments_total = 50000, format('expected adjustments_total 50000, got %s', v_entry_row.adjustments_total);

    -- Check later manual deduction precedence (Potongan tetap berlaku)
    PERFORM public.add_payroll_adjustment(v_period_id, v_teacher_id, -25000, 'Potongan terlambat');

    SELECT * INTO v_entry_row
    FROM public.payroll_entries
    WHERE period_id = v_period_id
      AND teacher_id = v_teacher_id;

    ASSERT v_entry_row.total_amount = 425000, format('expected total_amount 425000 after deduction, got %s', v_entry_row.total_amount);
    ASSERT v_entry_row.adjustments_total = 25000, format('expected adjustments_total 25000 (50k - 25k), got %s', v_entry_row.adjustments_total);

    -- Automatic top-up row must NOT have changed
    SELECT * INTO v_adj_row
    FROM public.payroll_adjustments
    WHERE period_id = v_period_id
      AND teacher_id = v_teacher_id
      AND kind = 'minimum_income_topup';

    ASSERT v_adj_row.amount = 50000, 'automatic top-up was recomputed after manual deduction';

    RAISE NOTICE 'Suite payroll-minimum passed all assertions.';
END $$;
