DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE role <> 'admin') THEN
    RAISE EXCEPTION 'Remote prune invariant failed: non-admin profile remains';
  END IF;
  IF EXISTS (SELECT 1 FROM public.students) THEN
    RAISE EXCEPTION 'Remote prune invariant failed: students remain';
  END IF;
  IF EXISTS (SELECT 1 FROM public.student_programs) THEN
    RAISE EXCEPTION 'Remote prune invariant failed: student programs remain';
  END IF;
  IF EXISTS (SELECT 1 FROM public.payroll_periods) THEN
    RAISE EXCEPTION 'Remote prune invariant failed: payroll periods remain';
  END IF;
  IF EXISTS (SELECT 1 FROM public.student_invoices) THEN
    RAISE EXCEPTION 'Remote prune invariant failed: student invoices remain';
  END IF;
END $$;
