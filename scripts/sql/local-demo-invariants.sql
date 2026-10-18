DO $$
DECLARE
  guru_count integer;
  student_count integer;
  multi_program_count integer;
  three_program_count integer;
  discount_none_count integer;
  discount_nominal_count integer;
  discount_percentage_count integer;
  paid_period_count integer;
  closed_period_count integer;
  open_period_count integer;
  guru_four_id uuid;
  guru_five_id uuid;
  guru_seven_id uuid;
  closed_period_id uuid;
BEGIN
  SELECT COUNT(*) INTO guru_count FROM public.profiles WHERE role = 'guru';
  IF guru_count <> 7 THEN
    RAISE EXCEPTION 'Fixture invariant failed: expected 7 gurus, got %', guru_count;
  END IF;

  SELECT COUNT(*) INTO student_count FROM public.students;
  IF student_count <> 24 THEN
    RAISE EXCEPTION 'Fixture invariant failed: expected 24 students, got %', student_count;
  END IF;

  SELECT COUNT(*) INTO multi_program_count
  FROM (
    SELECT student_id
    FROM public.student_programs
    GROUP BY student_id
    HAVING COUNT(*) >= 2
  ) multi_program;
  IF multi_program_count < 8 THEN
    RAISE EXCEPTION 'Fixture invariant failed: expected at least 8 multi-program students, got %', multi_program_count;
  END IF;

  SELECT COUNT(*) INTO three_program_count
  FROM (
    SELECT student_id
    FROM public.student_programs
    GROUP BY student_id
    HAVING COUNT(*) >= 3
  ) three_program;
  IF three_program_count < 1 THEN
    RAISE EXCEPTION 'Fixture invariant failed: no three-program student exists';
  END IF;

  SELECT COUNT(*) INTO discount_none_count
  FROM public.student_programs
  WHERE on_time_discount_type = 'none';
  SELECT COUNT(*) INTO discount_nominal_count
  FROM public.student_programs
  WHERE on_time_discount_type = 'nominal';
  SELECT COUNT(*) INTO discount_percentage_count
  FROM public.student_programs
  WHERE on_time_discount_type = 'percentage';
  IF discount_none_count < 6 OR discount_nominal_count < 6 OR discount_percentage_count < 6 THEN
    RAISE EXCEPTION 'Fixture invariant failed: discount distribution is incomplete';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.student_invoices invoice
    WHERE invoice.total_amount <> GREATEST(0, invoice.amount - invoice.discount_amount)
  ) THEN
    RAISE EXCEPTION 'Fixture invariant failed: invoice total does not match discount';
  END IF;

  SELECT COUNT(*) INTO paid_period_count FROM public.payroll_periods WHERE status = 'paid';
  SELECT COUNT(*) INTO closed_period_count FROM public.payroll_periods WHERE status = 'closed';
  SELECT COUNT(*) INTO open_period_count FROM public.payroll_periods WHERE status = 'open';
  IF paid_period_count <> 1 OR closed_period_count <> 1 OR open_period_count <> 1 THEN
    RAISE EXCEPTION 'Fixture invariant failed: payroll period statuses are incomplete';
  END IF;

  SELECT auth_user.id INTO guru_four_id
  FROM auth.users auth_user
  WHERE auth_user.email = 'guru.demo.04@uzmacourse.test';
  SELECT auth_user.id INTO guru_five_id
  FROM auth.users auth_user
  WHERE auth_user.email = 'guru.demo.05@uzmacourse.test';
  SELECT auth_user.id INTO guru_seven_id
  FROM auth.users auth_user
  WHERE auth_user.email = 'guru.demo.07@uzmacourse.test';
  SELECT id INTO closed_period_id FROM public.payroll_periods WHERE status = 'closed';

  IF NOT EXISTS (
    SELECT 1 FROM public.payroll_entries
    WHERE period_id = closed_period_id AND teacher_id = guru_four_id
  ) THEN
    RAISE EXCEPTION 'Fixture invariant failed: inactive Guru 04 has no payroll entry';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.payroll_entries
    WHERE period_id = closed_period_id AND teacher_id = guru_five_id
  ) THEN
    RAISE EXCEPTION 'Fixture invariant failed: inactive Guru 05 has a payroll entry without sessions';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.payroll_entries
    WHERE period_id = closed_period_id
      AND teacher_id = guru_seven_id
      AND minimum_income_snapshot = 0
  ) THEN
    RAISE EXCEPTION 'Fixture invariant failed: Guru 07 minimum-income snapshot is not zero';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.payroll_session_lines line
    WHERE (line.attendance_status <> 'present' AND line.payable_amount <> 0)
       OR (line.attendance_status = 'present' AND line.payable_amount <> line.teacher_fee_snapshot)
  ) THEN
    RAISE EXCEPTION 'Fixture invariant failed: payroll payable amount does not match attendance';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.student_invoices invoice
    LEFT JOIN public.student_payments payment ON payment.invoice_id = invoice.id
    WHERE invoice.status = 'paid' AND payment.id IS NULL
  ) THEN
    RAISE EXCEPTION 'Fixture invariant failed: paid invoice has no payment';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.student_invoices invoice
    JOIN public.student_payments payment ON payment.invoice_id = invoice.id
    WHERE invoice.status <> 'paid'
  ) THEN
    RAISE EXCEPTION 'Fixture invariant failed: non-paid invoice has a payment';
  END IF;
END $$;

SELECT jsonb_build_object(
  'gurus', (SELECT COUNT(*) FROM public.profiles WHERE role = 'guru'),
  'students', (SELECT COUNT(*) FROM public.students),
  'enrollments', (SELECT COUNT(*) FROM public.student_programs),
  'invoices', (SELECT COUNT(*) FROM public.student_invoices),
  'payments', (SELECT COUNT(*) FROM public.student_payments),
  'payrollPeriods', (SELECT COUNT(*) FROM public.payroll_periods),
  'payrollEntries', (SELECT COUNT(*) FROM public.payroll_entries)
) AS fixture_report;
