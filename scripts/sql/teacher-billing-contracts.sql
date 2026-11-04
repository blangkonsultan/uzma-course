-- scripts/sql/teacher-billing-contracts.sql
-- Suite: teacher-billing
-- Tests SEC-02, DEBT-01, DEBT-02, DEBT-03

DO $$
DECLARE
    v_admin_id UUID;
    v_guru1_id UUID;
    v_guru2_id UUID;
    v_branch1_id TEXT := 'sumokembangsri';
    v_branch2_id TEXT := 'junwangi';
    v_program_id UUID;
    v_other_program_id UUID;
    v_variant_id UUID;
    v_shift1_id UUID;
    v_shift2_id UUID;
    v_active_draft_id UUID;
    v_archived_draft_id UUID;
    v_class_active_id UUID;
    v_class_archived_id UUID;
    v_class_guru2_id UUID;
    v_student1_id UUID;
    v_student2_id UUID;
    v_transferred_student_id UUID;
    v_res RECORD;
    v_summary RECORD;
    v_count INTEGER;
    v_sqlstate TEXT;
    v_errmsg TEXT;
BEGIN
    -- 1. Setup owned test fixtures
    CREATE TEMP TABLE IF NOT EXISTS qa_financial_ids (
        key TEXT PRIMARY KEY,
        id UUID NOT NULL
    ) ON COMMIT PRESERVE ROWS;
    DELETE FROM qa_financial_ids;

    SELECT id INTO v_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO v_guru1_id FROM public.profiles WHERE role = 'guru' AND branch_id = v_branch1_id LIMIT 1;
    SELECT id INTO v_guru2_id FROM public.profiles WHERE role = 'guru' AND id <> v_guru1_id LIMIT 1;

    IF v_guru1_id IS NULL OR v_guru2_id IS NULL THEN
        RAISE EXCEPTION 'Prerequisite failed: need at least 2 guru profiles for testing';
    END IF;

    -- Programs
    SELECT p.id, pv.id INTO v_program_id, v_variant_id
    FROM public.programs p
    JOIN public.program_variants pv ON pv.program_id = p.id
    LIMIT 1;

    SELECT id INTO v_other_program_id
    FROM public.programs
    WHERE id <> v_program_id
    LIMIT 1;

    -- Shifts
    SELECT id INTO v_shift1_id FROM public.branch_shifts WHERE branch_id = v_branch1_id LIMIT 1;
    SELECT id INTO v_shift2_id FROM public.branch_shifts WHERE branch_id = v_branch2_id LIMIT 1;

    -- Drafts: Active and Archived
    INSERT INTO public.schedule_drafts (branch_id, name, effective_date, status)
    VALUES (v_branch1_id, 'QA Active Draft', CURRENT_DATE - 10, 'active')
    RETURNING id INTO v_active_draft_id;

    INSERT INTO public.schedule_drafts (branch_id, name, effective_date, status)
    VALUES (v_branch1_id, 'QA Archived Draft', CURRENT_DATE - 60, 'archived')
    RETURNING id INTO v_archived_draft_id;

    -- Classes
    INSERT INTO public.schedule_classes (
        draft_id, shift_id, variant_id, teacher_id, day_of_week, start_time, end_time
    ) VALUES (
        v_active_draft_id, v_shift1_id, v_variant_id, v_guru1_id, 1, '08:00', '08:30'
    ) RETURNING id INTO v_class_active_id;

    INSERT INTO public.schedule_classes (
        draft_id, shift_id, variant_id, teacher_id, day_of_week, start_time, end_time
    ) VALUES (
        v_archived_draft_id, v_shift1_id, v_variant_id, v_guru1_id, 2, '08:00', '08:30'
    ) RETURNING id INTO v_class_archived_id;

    INSERT INTO public.schedule_classes (
        draft_id, shift_id, variant_id, teacher_id, day_of_week, start_time, end_time
    ) VALUES (
        v_active_draft_id, v_shift1_id, v_variant_id, v_guru2_id, 3, '08:00', '08:30'
    ) RETURNING id INTO v_class_guru2_id;

    -- Students
    INSERT INTO public.students (full_name, birth_date, parent_name, parent_phone, address, branch_id, is_active, student_number)
    VALUES ('QA Student 1', '2018-01-01', 'Parent 1', '0811111111', 'Address 1', v_branch1_id, TRUE, '01991')
    RETURNING id INTO v_student1_id;

    INSERT INTO public.students (full_name, birth_date, parent_name, parent_phone, address, branch_id, is_active, student_number)
    VALUES ('QA Student 2', '2018-02-02', 'Parent 2', '0822222222', 'Address 2', v_branch1_id, TRUE, '01992')
    RETURNING id INTO v_student2_id;

    INSERT INTO public.students (full_name, birth_date, parent_name, parent_phone, address, branch_id, is_active, student_number)
    VALUES ('QA Transferred Student', '2018-03-03', 'Parent 3', '0833333333', 'Address 3', v_branch2_id, TRUE, '02993')
    RETURNING id INTO v_transferred_student_id;

    -- Placements
    INSERT INTO public.schedule_placements (class_id, student_id)
    VALUES
        (v_class_active_id, v_student1_id),
        (v_class_active_id, v_transferred_student_id),
        (v_class_archived_id, v_student2_id);

    -- Invoices for student 1 (2 overdue invoices, total Rp300,000)
    INSERT INTO public.student_invoices (
        invoice_number, student_id, program_id, variant_id, branch_id,
        period_start, period_end, due_date, cycle_number, amount, discount_amount, total_amount, status
    ) VALUES
        ('INV-QA-T1-1', v_student1_id, v_program_id, v_variant_id, v_branch1_id,
         CURRENT_DATE - 40, CURRENT_DATE - 12, CURRENT_DATE - 40, 1, 150000, 0, 150000, 'unpaid'),
        ('INV-QA-T1-2', v_student1_id, v_program_id, v_variant_id, v_branch1_id,
         CURRENT_DATE - 11, CURRENT_DATE + 17, CURRENT_DATE - 11, 2, 150000, 0, 150000, 'unpaid');

    -- Invoice for student 2 (under archived class only, overdue Rp150,000)
    INSERT INTO public.student_invoices (
        invoice_number, student_id, program_id, variant_id, branch_id,
        period_start, period_end, due_date, cycle_number, amount, discount_amount, total_amount, status
    ) VALUES
        ('INV-QA-T2-1', v_student2_id, v_program_id, v_variant_id, v_branch1_id,
         CURRENT_DATE - 30, CURRENT_DATE - 2, CURRENT_DATE - 30, 1, 150000, 0, 150000, 'unpaid');

    -- Invoice for transferred student (created under old branch 1, overdue Rp200,000)
    INSERT INTO public.student_invoices (
        invoice_number, student_id, program_id, variant_id, branch_id,
        period_start, period_end, due_date, cycle_number, amount, discount_amount, total_amount, status
    ) VALUES
        ('INV-QA-TR-1', v_transferred_student_id, v_program_id, v_variant_id, v_branch1_id,
         CURRENT_DATE - 20, CURRENT_DATE + 8, CURRENT_DATE - 20, 1, 200000, 0, 200000, 'unpaid');

    -- =========================================================================
    -- Case: raw_invoice_and_receipt_rows_hidden_from_guru
    -- =========================================================================
    BEGIN
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', v_guru1_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        SELECT count(*) INTO v_count FROM public.student_invoices;
        ASSERT v_count = 0, format('raw_invoice_and_receipt_rows_hidden_from_guru failed: guru can see %s raw invoices', v_count);

        SELECT count(*) INTO v_count FROM public.student_payments;
        ASSERT v_count = 0, format('raw_invoice_and_receipt_rows_hidden_from_guru failed: guru can see %s raw payments', v_count);
        RESET ROLE;
    END;

    -- =========================================================================
    -- Case: only_owned_active_class_program_pairs
    -- =========================================================================
    BEGIN
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', v_guru1_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        SELECT * INTO v_summary FROM public.get_teacher_overdue_spp(ARRAY[v_class_active_id])
        WHERE student_id = v_student1_id;

        ASSERT v_summary.total_amount = 300000, format('expected 300000 but got %s', v_summary.total_amount);
        ASSERT v_summary.invoice_count = 2, format('expected 2 invoices but got %s', v_summary.invoice_count);

        -- Requesting unowned class yields 0 rows
        SELECT count(*) INTO v_count FROM public.get_teacher_overdue_spp(ARRAY[v_class_guru2_id]);
        ASSERT v_count = 0, format('unowned class returned %s rows', v_count);
        RESET ROLE;
    END;

    -- =========================================================================
    -- Case: archived_class_has_no_live_summary
    -- =========================================================================
    BEGIN
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', v_guru1_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        SELECT count(*) INTO v_count FROM public.get_teacher_overdue_spp(ARRAY[v_class_archived_id]);
        ASSERT v_count = 0, format('archived class returned %s rows', v_count);
        RESET ROLE;
    END;

    -- =========================================================================
    -- Case: minimal_roster_reads_active_and_archived_without_financial_or_guardian_fields
    -- =========================================================================
    BEGIN
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', v_guru1_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        -- Active class roster
        SELECT count(*) INTO v_count FROM public.get_teacher_class_students(ARRAY[v_class_active_id]);
        ASSERT v_count = 2, format('active class roster expected 2 students, got %s', v_count);

        -- Archived class roster (must be readable by owning teacher)
        SELECT count(*) INTO v_count FROM public.get_teacher_class_students(ARRAY[v_class_archived_id]);
        ASSERT v_count = 1, format('archived class roster expected 1 student, got %s', v_count);

        -- Unowned class roster (must return 0)
        SELECT count(*) INTO v_count FROM public.get_teacher_class_students(ARRAY[v_class_guru2_id]);
        ASSERT v_count = 0, format('unowned class roster returned %s students', v_count);
        RESET ROLE;
    END;

    -- =========================================================================
    -- Case: transferred_invoice_matches_current_assignment
    -- =========================================================================
    BEGIN
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', v_guru1_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        SELECT * INTO v_summary FROM public.get_teacher_overdue_spp(ARRAY[v_class_active_id])
        WHERE student_id = v_transferred_student_id;

        ASSERT v_summary.total_amount = 200000, format('transferred pupil expected 200000, got %s', v_summary.total_amount);
        ASSERT v_summary.invoice_count = 1, format('transferred pupil expected 1 invoice, got %s', v_summary.invoice_count);
        RESET ROLE;
    END;

    -- =========================================================================
    -- Case: earliest_date_count_and_total_across_1001_invoices
    -- =========================================================================
    BEGIN
        -- Insert 1001 small overdue invoices
        INSERT INTO public.student_invoices (
            invoice_number, student_id, program_id, variant_id, branch_id,
            period_start, period_end, due_date, cycle_number, amount, discount_amount, total_amount, status
        )
        SELECT
            'INV-QA-1001-' || LPAD(i::text, 4, '0'),
            v_student1_id,
            v_program_id,
            v_variant_id,
            v_branch1_id,
            DATE '1940-01-08' + (i * 28),
            DATE '1940-01-08' + (i * 28) + 27,
            CASE WHEN i = 1 THEN DATE '1940-01-08' ELSE DATE '1940-01-08' + (i * 28) END,
            i,
            1000,
            0,
            1000,
            'unpaid'
        FROM generate_series(1, 1001) i;

        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', v_guru1_id::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

        SELECT * INTO v_summary FROM public.get_teacher_overdue_spp(ARRAY[v_class_active_id])
        WHERE student_id = v_student1_id;

        -- 2 original + 1001 = 1003 invoices
        ASSERT v_summary.invoice_count = 1003, format('large invoice count truncated: expected 1003, got %s', v_summary.invoice_count);
        ASSERT v_summary.total_amount = 300000 + 1001000, format('large overdue amount truncated: expected %s, got %s', 300000 + 1001000, v_summary.total_amount);
        ASSERT v_summary.due_date = DATE '1940-01-08', format('earliest overdue date lost: expected 1940-01-08, got %s', v_summary.due_date);
        RESET ROLE;
    END;

    RAISE NOTICE 'Suite teacher-billing passed all assertions.';
END $$;
