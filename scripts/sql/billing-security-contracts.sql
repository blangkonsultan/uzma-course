-- scripts/sql/billing-security-contracts.sql
-- Suite: billing-security
-- Tests SEC-01: Anonymous and unauthorized billing mutation guards

DO $$
DECLARE
    v_admin_id UUID;
    v_guru_id UUID;
    v_student_id UUID;
    v_program_id UUID;
    v_variant_id UUID;
    v_branch_id TEXT;
    v_invoice_id UUID;
    v_sqlstate TEXT;
    v_errmsg TEXT;
    v_payment public.student_payments;
    v_inv_count INTEGER;
BEGIN
    -- 1. Setup owned test fixtures
    CREATE TEMP TABLE IF NOT EXISTS qa_financial_ids (
        key TEXT PRIMARY KEY,
        id UUID NOT NULL
    ) ON COMMIT PRESERVE ROWS;
    DELETE FROM qa_financial_ids;

    -- Pick existing admin and guru profile IDs for actor testing
    SELECT id INTO v_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Prerequisite failed: no admin profile found';
    END IF;

    SELECT id INTO v_guru_id FROM public.profiles WHERE role = 'guru' LIMIT 1;
    IF v_guru_id IS NULL THEN
        RAISE EXCEPTION 'Prerequisite failed: no guru profile found';
    END IF;

    SELECT p.id, pv.id, b.id INTO v_program_id, v_variant_id, v_branch_id
    FROM public.programs p
    JOIN public.program_variants pv ON pv.program_id = p.id
    JOIN public.branches b ON b.id = 'sumokembangsri'
    LIMIT 1;
    -- Create disposable student for tests
    INSERT INTO public.students (
        full_name,
        birth_date,
        parent_name,
        parent_phone,
        address,
        branch_id,
        is_active
    ) VALUES (
        'QA Student SEC01',
        '2018-01-01',
        'Parent QA',
        '081234567890',
        'QA Address',
        v_branch_id,
        TRUE
    ) RETURNING id INTO v_student_id;

    -- Create disposable unpaid invoice
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
        status
    ) VALUES (
        'INV-QA-SEC01',
        v_student_id,
        v_program_id,
        v_variant_id,
        v_branch_id,
        CURRENT_DATE - INTERVAL '14 days',
        CURRENT_DATE + INTERVAL '14 days',
        CURRENT_DATE - INTERVAL '1 day',
        1,
        150000,
        0,
        150000,
        'unpaid'
    ) RETURNING id INTO v_invoice_id;

    INSERT INTO qa_financial_ids (key, id) VALUES
        ('admin', v_admin_id),
        ('guru', v_guru_id),
        ('student', v_student_id),
        ('invoice', v_invoice_id);

    -- =========================================================================
    -- Case: anonymous_payment_denied
    -- =========================================================================
    BEGIN
        -- Simulate anonymous request (auth.uid() is null, role is anon)
        PERFORM set_config('request.jwt.claim.sub', '', true);
        PERFORM set_config('request.jwt.claim.role', 'anon', true);

        v_sqlstate := '00000';
        BEGIN
            PERFORM public.record_student_payment(
                v_invoice_id,
                'cash',
                CURRENT_DATE,
                NULL,
                'Anonymous test note'
            );
        EXCEPTION WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_errmsg = MESSAGE_TEXT;
        END;

        ASSERT v_sqlstate = '42501', format('anonymous_payment_denied failed: expected 42501 but got %s: %s', v_sqlstate, v_errmsg);
        ASSERT (SELECT count(*) FROM public.student_payments WHERE invoice_id = v_invoice_id) = 0,
            'anonymous_payment_denied failed: payment record was created';
        ASSERT (SELECT status FROM public.student_invoices WHERE id = v_invoice_id) = 'unpaid',
            'anonymous_payment_denied failed: invoice status changed from unpaid';
    END;

    -- =========================================================================
    -- Case: anonymous_generation_denied
    -- =========================================================================
    BEGIN
        PERFORM set_config('request.jwt.claim.sub', '', true);
        PERFORM set_config('request.jwt.claim.role', 'anon', true);

        v_sqlstate := '00000';
        BEGIN
            PERFORM public.generate_due_student_invoices(v_branch_id);
        EXCEPTION WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_errmsg = MESSAGE_TEXT;
        END;

        ASSERT v_sqlstate = '42501', format('anonymous_generation_denied failed: expected 42501 but got %s: %s', v_sqlstate, v_errmsg);
    END;

    -- =========================================================================
    -- Case: guru_payment_denied
    -- =========================================================================
    BEGIN
        PERFORM set_config('request.jwt.claim.sub', v_guru_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        v_sqlstate := '00000';
        BEGIN
            PERFORM public.record_student_payment(
                v_invoice_id,
                'cash',
                CURRENT_DATE,
                NULL,
                'Guru test payment'
            );
        EXCEPTION WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_errmsg = MESSAGE_TEXT;
        END;

        ASSERT v_sqlstate = '42501', format('guru_payment_denied failed: expected 42501 but got %s: %s', v_sqlstate, v_errmsg);
        ASSERT (SELECT count(*) FROM public.student_payments WHERE invoice_id = v_invoice_id) = 0,
            'guru_payment_denied failed: payment record was created';
    END;

    -- =========================================================================
    -- Case: guru_generation_denied
    -- =========================================================================
    BEGIN
        PERFORM set_config('request.jwt.claim.sub', v_guru_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        v_sqlstate := '00000';
        BEGIN
            PERFORM public.generate_due_student_invoices(v_branch_id);
        EXCEPTION WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_errmsg = MESSAGE_TEXT;
        END;

        ASSERT v_sqlstate = '42501', format('guru_generation_denied failed: expected 42501 but got %s: %s', v_sqlstate, v_errmsg);
    END;

    -- =========================================================================
    -- Case: admin_payment_attributed_once
    -- =========================================================================
    BEGIN
        PERFORM set_config('request.jwt.claim.sub', v_admin_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        v_payment := public.record_student_payment(
            v_invoice_id,
            'cash',
            CURRENT_DATE,
            'REF-ADMIN-01',
            'Admin payment note'
        );

        ASSERT v_payment.id IS NOT NULL, 'admin_payment_attributed_once failed: payment is null';
        ASSERT v_payment.received_by = v_admin_id, format('admin_payment_attributed_once failed: received_by %s != admin %s', v_payment.received_by, v_admin_id);
        ASSERT (SELECT status FROM public.student_invoices WHERE id = v_invoice_id) = 'paid', 'admin_payment_attributed_once failed: invoice not paid';
    END;

    RAISE NOTICE 'Suite billing-security passed all assertions.';
END $$;
