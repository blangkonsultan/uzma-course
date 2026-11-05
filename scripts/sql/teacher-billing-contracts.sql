-- Suite: teacher-billing. Standalone owned fixtures; caller MUST wrap in a rollback transaction.
-- No operational profile, branch, program, shift, student, or invoice is reused.
DO $$
DECLARE
    v_tag TEXT := replace(gen_random_uuid()::text, '-', '');
    v_today DATE := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date;
    v_admin UUID := gen_random_uuid();
    v_guru UUID := gen_random_uuid();
    v_other_guru UUID := gen_random_uuid();
    v_primary TEXT;
    v_secondary TEXT;
    v_program UUID := gen_random_uuid();
    v_history_program UUID := gen_random_uuid();
    v_unowned_program UUID := gen_random_uuid();
    v_public_program UUID := gen_random_uuid();
    v_variant UUID := gen_random_uuid();
    v_history_variant UUID := gen_random_uuid();
    v_unowned_variant UUID := gen_random_uuid();
    v_unassigned_variant UUID := gen_random_uuid();
    v_public_variant UUID := gen_random_uuid();
    v_shift UUID := gen_random_uuid();
    v_secondary_shift UUID := gen_random_uuid();
    v_draft UUID := gen_random_uuid();
    v_secondary_draft UUID := gen_random_uuid();
    v_history_draft UUID := gen_random_uuid();
    v_class UUID := gen_random_uuid();
    v_secondary_class UUID := gen_random_uuid();
    v_history_class UUID := gen_random_uuid();
    v_unowned_class UUID := gen_random_uuid();
    v_student UUID := gen_random_uuid();
    v_transferred UUID := gen_random_uuid();
    v_historical UUID := gen_random_uuid();
    v_bulk UUID := gen_random_uuid();
    v_unowned_student UUID := gen_random_uuid();
    v_paid_invoice UUID := gen_random_uuid();
    v_summary RECORD;
    v_count INTEGER;
    v_function TEXT;
    v_role TEXT;
    v_denied BOOLEAN;
BEGIN
    v_primary := 'qa-teacher-primary-' || v_tag;
    v_secondary := 'qa-teacher-secondary-' || v_tag;
    -- Emit before any persistent write so the runner can audit even failed setup.
    -- Foreign-key descriptors cover every generated dependent row ID.
    RAISE NOTICE 'qa_financial_manifest:%', jsonb_build_array(
        jsonb_build_object('table', 'auth.users', 'column', 'id', 'ids', ARRAY[v_admin, v_guru, v_other_guru]),
        jsonb_build_object('table', 'public.profiles', 'column', 'id', 'ids', ARRAY[v_admin, v_guru, v_other_guru]),
        jsonb_build_object('table', 'public.branches', 'column', 'id', 'ids', ARRAY[v_primary, v_secondary]),
        jsonb_build_object('table', 'public.programs', 'column', 'id', 'ids', ARRAY[v_program, v_history_program, v_unowned_program, v_public_program]),
        jsonb_build_object('table', 'public.program_variants', 'column', 'id', 'ids', ARRAY[v_variant, v_history_variant, v_unowned_variant, v_unassigned_variant, v_public_variant]),
        jsonb_build_object('table', 'public.branch_shifts', 'column', 'id', 'ids', ARRAY[v_shift, v_secondary_shift]),
        jsonb_build_object('table', 'public.schedule_drafts', 'column', 'id', 'ids', ARRAY[v_draft, v_secondary_draft, v_history_draft]),
        jsonb_build_object('table', 'public.schedule_classes', 'column', 'id', 'ids', ARRAY[v_class, v_secondary_class, v_history_class, v_unowned_class]),
        jsonb_build_object('table', 'public.students', 'column', 'id', 'ids', ARRAY[v_student, v_transferred, v_historical, v_bulk, v_unowned_student]),
        jsonb_build_object('table', 'public.profile_branches', 'column', 'profile_id', 'ids', ARRAY[v_guru]),
        jsonb_build_object('table', 'public.schedule_placements', 'column', 'class_id', 'ids', ARRAY[v_class, v_secondary_class, v_history_class, v_unowned_class]),
        jsonb_build_object('table', 'public.student_invoices', 'column', 'student_id', 'ids', ARRAY[v_student, v_transferred, v_historical, v_bulk, v_unowned_student]),
        jsonb_build_object('table', 'public.student_payments', 'column', 'student_id', 'ids', ARRAY[v_student, v_transferred, v_historical, v_bulk, v_unowned_student])
    );
    INSERT INTO public.branches (id, name) VALUES
        (v_primary, 'QA primary ' || v_tag), (v_secondary, 'QA secondary ' || v_tag);
    -- Signup trigger creates the profiles; update ONLY these newly owned rows.
    INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
        (v_admin, 'qa-teacher-admin-' || v_tag || '@example.invalid', jsonb_build_object('full_name', 'QA Admin', 'role', 'admin')),
        (v_guru, 'qa-teacher-owner-' || v_tag || '@example.invalid', jsonb_build_object('full_name', 'QA Owner', 'role', 'guru')),
        (v_other_guru, 'qa-teacher-other-' || v_tag || '@example.invalid', jsonb_build_object('full_name', 'QA Other', 'role', 'guru'));
    UPDATE public.profiles SET branch_id = v_primary WHERE id IN (v_admin, v_guru, v_other_guru);
    -- Hardened signup intentionally ignores role metadata; elevate only our owned admin.
    UPDATE public.profiles SET role = 'admin' WHERE id = v_admin;
    INSERT INTO public.profile_branches (profile_id, branch_id, is_primary) VALUES
        (v_guru, v_primary, true), (v_guru, v_secondary, false);
    INSERT INTO public.programs (id, initials, name, is_active) VALUES
        (v_program, 'QA-own-' || v_tag, 'QA inactive assigned program', false),
        (v_history_program, 'QA-history-' || v_tag, 'QA inactive historical program', false),
        (v_unowned_program, 'QA-other-' || v_tag, 'QA inactive unowned program', false),
        (v_public_program, 'QA-public-' || v_tag, 'QA active public program', true);
    -- Primary roster intentionally contains three pupils; respect the normal capacity trigger.
    INSERT INTO public.program_variants (id, program_id, name, is_active, system) VALUES
        (v_variant, v_program, 'QA inactive assigned variant', false, 3),
        (v_history_variant, v_history_program, 'QA inactive historical variant', false, 2),
        (v_unowned_variant, v_unowned_program, 'QA inactive unowned variant', false, 2),
        (v_unassigned_variant, v_program, 'QA inactive unassigned sibling variant', false, 2),
        (v_public_variant, v_public_program, 'QA active public variant', true, 2);
    INSERT INTO public.branch_shifts (id, branch_id, name, start_time, end_time) VALUES
        (v_shift, v_primary, 'QA primary shift', '08:00', '09:00'),
        (v_secondary_shift, v_secondary, 'QA secondary shift', '08:00', '09:00');
    INSERT INTO public.schedule_drafts (id, branch_id, name, effective_date, status) VALUES
        (v_draft, v_primary, 'QA active primary', v_today - 10, 'active'),
        (v_secondary_draft, v_secondary, 'QA active secondary', v_today - 10, 'active'),
        (v_history_draft, v_secondary, 'QA archived secondary', v_today - 60, 'archived');
    INSERT INTO public.schedule_classes (id, draft_id, shift_id, variant_id, teacher_id, day_of_week, start_time, end_time) VALUES
        (v_class, v_draft, v_shift, v_variant, v_guru, 1, '08:00', '08:30'),
        (v_secondary_class, v_secondary_draft, v_secondary_shift, v_variant, v_guru, 2, '08:00', '08:30'),
        (v_history_class, v_history_draft, v_secondary_shift, v_history_variant, v_guru, 3, '08:00', '08:30'),
        (v_unowned_class, v_draft, v_shift, v_unowned_variant, v_other_guru, 4, '08:00', '08:30');
    INSERT INTO public.students (id, full_name, parent_name, parent_phone, branch_id) VALUES
        (v_student, 'QA primary student', 'QA guardian', '0800000001', v_primary),
        (v_transferred, 'QA transferred student', 'QA guardian', '0800000002', v_secondary),
        (v_historical, 'QA secondary historical student', 'QA guardian', '0800000003', v_secondary),
        (v_bulk, 'QA 1001 invoice student', 'QA guardian', '0800000004', v_primary),
        (v_unowned_student, 'QA unowned student', 'QA guardian', '0800000005', v_primary);
    INSERT INTO public.schedule_placements (class_id, student_id) VALUES
        (v_class, v_student), (v_class, v_transferred), (v_class, v_bulk),
        (v_secondary_class, v_historical), (v_history_class, v_historical),
        (v_unowned_class, v_unowned_student);

    INSERT INTO public.student_invoices (
        id, invoice_number, student_id, program_id, variant_id, branch_id,
        period_start, period_end, due_date, amount, total_amount, status
    ) VALUES
        (gen_random_uuid(), 'QA-' || v_tag || '-own-1', v_student, v_program, v_variant, v_primary,
         v_today - 100, v_today - 73, v_today - 40, 150000, 150000, 'unpaid'),
        (gen_random_uuid(), 'QA-' || v_tag || '-own-2', v_student, v_program, v_variant, v_primary,
         v_today - 72, v_today - 45, v_today - 11, 150000, 150000, 'unpaid'),
        -- All exclusion controls have older dates and distinct amounts: any leak changes every aggregate.
        (gen_random_uuid(), 'QA-' || v_tag || '-other-program', v_student, v_history_program, v_history_variant, v_primary,
         v_today - 300, v_today - 273, v_today - 300, 910000, 910000, 'unpaid'),
        (v_paid_invoice, 'QA-' || v_tag || '-paid', v_student, v_program, v_variant, v_primary,
         v_today - 400, v_today - 373, v_today - 400, 920000, 920000, 'paid'),
        (gen_random_uuid(), 'QA-' || v_tag || '-cancelled', v_student, v_program, v_variant, v_primary,
         v_today - 500, v_today - 473, v_today - 500, 930000, 930000, 'cancelled'),
        (gen_random_uuid(), 'QA-' || v_tag || '-today', v_student, v_program, v_variant, v_primary,
         v_today, v_today + 27, v_today, 940000, 940000, 'unpaid'),
        (gen_random_uuid(), 'QA-' || v_tag || '-future', v_student, v_program, v_variant, v_primary,
         v_today + 28, v_today + 55, v_today + 1, 950000, 950000, 'unpaid'),
        (gen_random_uuid(), 'QA-' || v_tag || '-transfer', v_transferred, v_program, v_variant, v_primary,
         v_today - 28, v_today - 1, v_today - 20, 200000, 200000, 'unpaid'),
        (gen_random_uuid(), 'QA-' || v_tag || '-secondary', v_historical, v_program, v_variant, v_secondary,
         v_today - 28, v_today - 1, v_today - 15, 45000, 45000, 'unpaid'),
        (gen_random_uuid(), 'QA-' || v_tag || '-archived', v_historical, v_history_program, v_history_variant, v_secondary,
         v_today - 28, v_today - 1, v_today - 25, 65000, 65000, 'unpaid'),
        (gen_random_uuid(), 'QA-' || v_tag || '-unowned', v_unowned_student, v_unowned_program, v_unowned_variant, v_primary,
         v_today - 28, v_today - 1, v_today - 28, 990000, 990000, 'unpaid');
    INSERT INTO public.student_payments (receipt_number, invoice_id, student_id, amount_paid, payment_method, received_by)
    VALUES ('QA-receipt-' || v_tag, v_paid_invoice, v_student, 920000, 'cash', v_admin);
    -- Exactly 1001 qualifying source invoices, nonuniform amounts and deterministic earliest date.
    INSERT INTO public.student_invoices (
        invoice_number, student_id, program_id, variant_id, branch_id,
        period_start, period_end, due_date, cycle_number, amount, total_amount, status
    )
    SELECT 'QA-' || v_tag || '-bulk-' || i, v_bulk, v_program, v_variant, v_primary,
        DATE '1940-01-01' + i * 28, DATE '1940-01-01' + i * 28 + 27,
        v_today - (1002 - i), i, 1000 + i, 1000 + i, 'unpaid'
    FROM generate_series(1, 1001) i;

    -- Both RPCs enforce the actor boundary, independently of requested class contents.
    FOREACH v_function IN ARRAY ARRAY['get_teacher_overdue_spp', 'get_teacher_class_students'] LOOP
        ASSERT NOT has_function_privilege('anon', format('public.%I(uuid[])', v_function), 'EXECUTE'),
            format('%s must deny effective anonymous execution', v_function);
        FOREACH v_role IN ARRAY ARRAY['authenticated', 'service_role'] LOOP
            v_denied := false;
            EXECUTE format('SET LOCAL ROLE %I', v_role);
            PERFORM set_config('request.jwt.claim.sub', '', true);
            PERFORM set_config('request.jwt.claims', '{}', true);
            PERFORM set_config('request.jwt.claim.role', v_role, true);
            BEGIN
                EXECUTE format('SELECT count(*) FROM public.%I($1)', v_function) USING ARRAY[v_class];
            EXCEPTION WHEN insufficient_privilege THEN
                v_denied := true;
            END;
            RESET ROLE;
            ASSERT v_denied, format('%s accepted UID-less %s', v_function, v_role);
        END LOOP;
        SET LOCAL ROLE authenticated;
        PERFORM set_config('request.jwt.claim.sub', v_admin::text, true);
        PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
        v_denied := false;
        BEGIN
            EXECUTE format('SELECT count(*) FROM public.%I($1)', v_function) USING ARRAY[v_class];
        EXCEPTION WHEN insufficient_privilege THEN
            v_denied := true;
        END;
        RESET ROLE;
        ASSERT v_denied, format('%s accepted an admin as a teacher', v_function);
    END LOOP;

    SET LOCAL ROLE authenticated;
    PERFORM set_config('request.jwt.claim.sub', v_guru::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
    SELECT count(*) INTO v_count FROM public.student_invoices;
    ASSERT v_count = 0, 'guru must not read raw invoices';
    SELECT count(*) INTO v_count FROM public.student_payments;
    ASSERT v_count = 0, 'guru must not read raw receipts';
    SELECT count(*) INTO v_count FROM public.students WHERE id IN (v_transferred, v_historical);
    ASSERT v_count = 0, 'metadata/roster authorization must not broaden secondary-branch student table reads';

    SELECT * INTO STRICT v_summary FROM public.get_teacher_overdue_spp(ARRAY[v_class, v_class])
        WHERE student_id = v_student;
    ASSERT v_summary.total_amount = 300000 AND v_summary.invoice_count = 2 AND v_summary.due_date = v_today - 40,
        'owned summary must exclude other programs, paid/cancelled/today/future invoices and deduplicate IDs';
    ASSERT v_summary.class_id = v_class AND v_summary.program_id = v_program, 'summary key changed';
    SELECT * INTO STRICT v_summary FROM public.get_teacher_overdue_spp(ARRAY[v_class]) WHERE student_id = v_transferred;
    ASSERT v_summary.total_amount = 200000 AND v_summary.invoice_count = 1 AND v_summary.due_date = v_today - 20,
        'transferred pupil must retain authorized old-branch invoice';
    SELECT * INTO STRICT v_summary FROM public.get_teacher_overdue_spp(ARRAY[v_class]) WHERE student_id = v_bulk;
    ASSERT v_summary.total_amount = 1502501 AND v_summary.invoice_count = 1001 AND v_summary.due_date = v_today - 1001,
        '1001 source invoices must aggregate exactly before API row limiting';
    SELECT * INTO STRICT v_summary FROM public.get_teacher_overdue_spp(ARRAY[v_secondary_class]) WHERE student_id = v_historical;
    ASSERT v_summary.total_amount = 45000 AND v_summary.invoice_count = 1 AND v_summary.due_date = v_today - 15,
        'secondary class must use the same ownership/program authorization';
    SELECT count(*) INTO v_count FROM public.get_teacher_overdue_spp(ARRAY[v_history_class, v_unowned_class]);
    ASSERT v_count = 0, 'archived and unowned requests must return no live summaries';
    SELECT count(*) INTO v_count FROM public.get_teacher_overdue_spp(ARRAY[v_class, v_class, v_secondary_class, v_history_class, v_unowned_class]);
    ASSERT v_count = 4, 'mixed requests must return exactly the four owned active student/program groups';

    SELECT count(*) INTO v_count FROM public.get_teacher_class_students(ARRAY[v_class, v_class]);
    ASSERT v_count = 3, 'duplicate requested class IDs must not duplicate the primary roster';
    SELECT count(*) INTO v_count FROM public.get_teacher_class_students(ARRAY[v_history_class])
        WHERE student_id = v_historical AND full_name = 'QA secondary historical student' AND student_number IS NULL;
    ASSERT v_count = 1, 'archived secondary roster must remain readable';
    SELECT count(*) INTO v_count FROM public.get_teacher_class_students(ARRAY[v_secondary_class]);
    ASSERT v_count = 1, 'active secondary roster must remain readable';
    SELECT count(*) INTO v_count FROM public.get_teacher_class_students(ARRAY[v_unowned_class]);
    ASSERT v_count = 0, 'unowned roster must be hidden';
    SELECT count(*) INTO v_count FROM public.get_teacher_class_students(ARRAY[v_class, v_class, v_history_class, v_secondary_class, v_unowned_class]);
    ASSERT v_count = 5, 'mixed roster must retain each owned historical/current class exactly once';

    -- These are invoker SELECTs under the same role as the cookie-authenticated nested DAL query.
    -- Joining both directions also catches recursive policies (not merely an isolated policy predicate).
    SELECT count(*) INTO v_count
    FROM public.schedule_classes sc
    JOIN public.schedule_drafts sd ON sd.id = sc.draft_id
    JOIN public.program_variants pv ON pv.id = sc.variant_id
    JOIN public.programs p ON p.id = pv.program_id
    WHERE sc.id IN (v_class, v_secondary_class, v_history_class)
      AND pv.is_active = false AND p.is_active = false
      AND ((sc.id IN (v_class, v_secondary_class) AND p.id = v_program AND pv.name = 'QA inactive assigned variant')
        OR (sc.id = v_history_class AND p.id = v_history_program AND pv.name = 'QA inactive historical variant'));
    ASSERT v_count = 3, 'owned inactive current/historical variant and parent metadata must survive nested reads';
    SELECT count(*) INTO v_count FROM public.program_variants WHERE id IN (v_unowned_variant, v_unassigned_variant);
    ASSERT v_count = 0, 'ownership of a program must not reveal its unassigned inactive sibling variant';
    RESET ROLE;

    -- Other teacher gets their metadata but neither of the first teacher historical/current variants.
    SET LOCAL ROLE authenticated;
    PERFORM set_config('request.jwt.claim.sub', v_other_guru::text, true);
    SELECT count(*) INTO v_count FROM public.program_variants WHERE id = v_unowned_variant;
    ASSERT v_count = 1, 'other teacher must read their own assigned inactive variant';
    SELECT count(*) INTO v_count FROM public.program_variants WHERE id IN (v_variant, v_history_variant, v_unassigned_variant);
    ASSERT v_count = 0, 'inactive variant access must not cross teacher ownership';
    SELECT count(*) INTO v_count FROM public.get_teacher_overdue_spp(ARRAY[v_class, v_history_class, v_secondary_class]);
    ASSERT v_count = 0, 'other teacher must not read first teacher debt';
    RESET ROLE;

    -- Anonymous inactive variants stay hidden; existing parent-program visibility is unchanged.
    SET LOCAL ROLE anon;
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claim.role', 'anon', true);
    SELECT count(*) INTO v_count FROM public.program_variants WHERE id IN (v_variant, v_history_variant, v_unowned_variant, v_unassigned_variant);
    ASSERT v_count = 0, 'anonymous access must not reveal inactive variants';
    SELECT count(*) INTO v_count FROM public.programs WHERE id IN (v_program, v_history_program, v_unowned_program);
    ASSERT v_count = 3, 'existing public parent-program visibility must remain unchanged';
    SELECT count(*) INTO v_count FROM public.program_variants pv JOIN public.programs p ON p.id = pv.program_id
        WHERE pv.id = v_public_variant AND p.id = v_public_program;
    ASSERT v_count = 1, 'public active catalogue must stay readable';
    RESET ROLE;
    SET LOCAL ROLE authenticated;
    PERFORM set_config('request.jwt.claim.sub', v_admin::text, true);
    PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
    SELECT count(*) INTO v_count FROM public.student_invoices WHERE invoice_number LIKE 'QA-' || v_tag || '-%';
    ASSERT v_count = 1012, 'admin must still read all 11 control plus 1001 source invoices';
    SELECT count(*) INTO v_count FROM public.student_payments WHERE receipt_number = 'QA-receipt-' || v_tag;
    ASSERT v_count = 1, 'admin must still read raw receipt';
    SELECT count(*) INTO v_count FROM public.program_variants WHERE id IN (v_variant, v_history_variant, v_unowned_variant, v_unassigned_variant);
    ASSERT v_count = 4, 'admin inactive metadata access must remain unchanged';
    RESET ROLE;
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claim.role', '', true);
    RAISE NOTICE 'Suite teacher-billing passed all assertions (owned fixture tag %; caller rolls back).', v_tag;
END $$;
