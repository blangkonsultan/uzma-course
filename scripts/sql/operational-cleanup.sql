TRUNCATE TABLE
  public.student_payments,
  public.student_invoices,
  public.payroll_adjustments,
  public.payroll_entries,
  public.payroll_session_lines,
  public.payroll_periods,
  public.teaching_session_students,
  public.teaching_sessions,
  public.teacher_attendances,
  public.schedule_placements,
  public.schedule_classes,
  public.schedule_drafts,
  public.student_programs,
  public.students,
  public.branch_shifts;

-- Remove local-only orphaned admin profiles left without an Auth user.
DELETE FROM public.profile_branches
WHERE profile_id IN (
  SELECT p.id
  FROM public.profiles p
  WHERE p.role = 'admin'
    AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
);

DELETE FROM public.profile_programs
WHERE profile_id IN (
  SELECT p.id
  FROM public.profiles p
  WHERE p.role = 'admin'
    AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
);

DELETE FROM public.profiles p
WHERE p.role = 'admin'
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id);

DELETE FROM public.profile_branches
WHERE profile_id IN (
  SELECT id FROM public.profiles WHERE role <> 'admin'
);

DELETE FROM public.profile_programs
WHERE profile_id IN (
  SELECT id FROM public.profiles WHERE role <> 'admin'
);

DELETE FROM auth.users
WHERE id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);
