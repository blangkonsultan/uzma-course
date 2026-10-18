WITH guru_rows AS (
  SELECT *
  FROM jsonb_to_recordset(__GURU_FIXTURES_JSON__::jsonb) AS x(
    guru_key text,
    email text,
    "fullName" text,
    phone text,
    "primaryBranchId" text,
    "branchIds" jsonb,
    "programInitials" jsonb,
    "isActive" boolean,
    "minimumIncome" integer,
    allowances jsonb
  )
)
UPDATE public.profiles profile
SET
  full_name = guru."fullName",
  phone = guru.phone,
  branch_id = guru."primaryBranchId",
  is_active = guru."isActive",
  allowances = guru.allowances,
  minimum_income = guru."minimumIncome"
FROM guru_rows guru
JOIN auth.users auth_user ON auth_user.email = guru.email
WHERE profile.id = auth_user.id;

WITH guru_rows AS (
  SELECT *
  FROM jsonb_to_recordset(__GURU_FIXTURES_JSON__::jsonb) AS x(
    email text,
    "primaryBranchId" text,
    "branchIds" jsonb
  )
), branch_rows AS (
  SELECT
    auth_user.id AS profile_id,
    branch.value #>> '{}' AS branch_id,
    (branch.value #>> '{}') = guru."primaryBranchId" AS is_primary
  FROM guru_rows guru
  JOIN auth.users auth_user ON auth_user.email = guru.email
  CROSS JOIN LATERAL jsonb_array_elements(guru."branchIds") branch
)
INSERT INTO public.profile_branches (profile_id, branch_id, is_primary)
SELECT profile_id, branch_id, is_primary
FROM branch_rows
ON CONFLICT (profile_id, branch_id) DO UPDATE
SET is_primary = EXCLUDED.is_primary;

WITH guru_rows AS (
  SELECT *
  FROM jsonb_to_recordset(__GURU_FIXTURES_JSON__::jsonb) AS x(
    email text,
    "programInitials" jsonb
  )
), program_rows AS (
  SELECT auth_user.id AS profile_id, program.value #>> '{}' AS initials
  FROM guru_rows guru
  JOIN auth.users auth_user ON auth_user.email = guru.email
  CROSS JOIN LATERAL jsonb_array_elements(guru."programInitials") program
)
INSERT INTO public.profile_programs (profile_id, program_id)
SELECT rows.profile_id, program.id
FROM program_rows rows
JOIN public.programs program ON program.initials = rows.initials
ON CONFLICT (profile_id, program_id) DO NOTHING;

INSERT INTO public.branch_shifts (branch_id, name, start_time, end_time, is_active)
VALUES
  ('sumokembangsri', 'Pagi', '08:00', '08:30', TRUE),
  ('sumokembangsri', 'Sore', '16:00', '16:30', TRUE),
  ('junwangi', 'Pagi', '09:00', '09:30', TRUE),
  ('junwangi', 'Sore', '17:00', '17:30', TRUE);

INSERT INTO public.schedule_drafts (branch_id, name, effective_date, status)
VALUES
  ('sumokembangsri', 'Demo Schedule sumokembangsri', current_date - 30, 'active'),
  ('junwangi', 'Demo Schedule junwangi', current_date - 30, 'active');

WITH student_rows AS (
  SELECT *
  FROM jsonb_to_recordset(__STUDENT_FIXTURES_JSON__::jsonb) AS x(
    student_key text,
    "studentNumber" text,
    "fullName" text,
    "birthDate" date,
    "parentName" text,
    "parentPhone" text,
    "parentEmail" text,
    "branchId" text,
    "isActive" boolean,
    "lifecycleStatus" text
  )
)
INSERT INTO public.students (
  full_name,
  birth_date,
  address,
  parent_name,
  parent_phone,
  parent_email,
  branch_id,
  is_active,
  notes,
  student_number,
  joined_date
)
SELECT
  student."fullName",
  student."birthDate",
  'Alamat demo ' || student.student_key,
  student."parentName",
  student."parentPhone",
  student."parentEmail",
  student."branchId",
  student."isActive",
  'Fixture lifecycle: ' || student."lifecycleStatus",
  student."studentNumber",
  current_date - 56
FROM student_rows student;

WITH enrollment_rows AS (
  SELECT *
  FROM jsonb_to_recordset(__ENROLLMENT_FIXTURES_JSON__::jsonb) AS x(
    "studentKey" text,
    "programInitials" text,
    status text,
    "sppAmount" numeric,
    "discountType" text,
    "discountValue" integer
  )
)
INSERT INTO public.student_programs (
  student_id,
  program_id,
  spp_amount,
  enrolled_at,
  status,
  variant_id,
  on_time_discount_type,
  on_time_discount_value,
  cycle_start_date,
  cycle_days
)
SELECT
  student.id,
  program.id,
  enrollment."sppAmount",
  current_date - 35,
  enrollment.status,
  variant.id,
  enrollment."discountType",
  enrollment."discountValue",
  current_date - 7,
  28
FROM enrollment_rows enrollment
JOIN public.students student ON student.student_number = replace(upper(enrollment."studentKey"), 'STUDENT-', 'DM-')
JOIN public.programs program ON program.initials = enrollment."programInitials"
JOIN LATERAL (
  SELECT program_variant.id
  FROM public.program_variants program_variant
  WHERE program_variant.program_id = program.id
    AND program_variant.is_active = TRUE
  ORDER BY program_variant.sort_order, program_variant.created_at
  LIMIT 1
) variant ON TRUE;

WITH class_specs(teacher_email, branch_id, program_initials, shift_name, day_of_week, student_numbers) AS (
  VALUES
    ('guru.demo.01@uzmacourse.test', 'sumokembangsri', 'AHE', 'Pagi', 1, ARRAY['DM-001', 'DM-003']::text[]),
    ('guru.demo.02@uzmacourse.test', 'junwangi', 'ASE', 'Pagi', 2, ARRAY['DM-002', 'DM-004']::text[]),
    ('guru.demo.03@uzmacourse.test', 'sumokembangsri', 'BEE', 'Sore', 3, ARRAY['DM-005', 'DM-007']::text[]),
    ('guru.demo.03@uzmacourse.test', 'junwangi', 'MAPEL', 'Sore', 4, ARRAY['DM-006']::text[]),
    ('guru.demo.04@uzmacourse.test', 'sumokembangsri', 'AHE', 'Pagi', 5, ARRAY['DM-009', 'DM-011']::text[]),
    ('guru.demo.06@uzmacourse.test', 'junwangi', 'BEE', 'Sore', 6, ARRAY['DM-010', 'DM-012']::text[]),
    ('guru.demo.07@uzmacourse.test', 'sumokembangsri', 'MAPEL', 'Pagi', 7, ARRAY['DM-013']::text[])
), inserted_classes AS (
  INSERT INTO public.schedule_classes (
    draft_id,
    shift_id,
    day_of_week,
    teacher_id,
    variant_id,
    start_time,
    end_time
  )
  SELECT
    draft.id,
    shift.id,
    spec.day_of_week,
    auth_user.id,
    variant.id,
    shift.start_time,
    shift.end_time
  FROM class_specs spec
  JOIN auth.users auth_user ON auth_user.email = spec.teacher_email
  JOIN public.schedule_drafts draft
    ON draft.branch_id = spec.branch_id
   AND draft.name = 'Demo Schedule ' || spec.branch_id
   AND draft.status = 'active'
  JOIN public.branch_shifts shift
    ON shift.branch_id = spec.branch_id
   AND shift.name = spec.shift_name
  JOIN public.programs program ON program.initials = spec.program_initials
  JOIN LATERAL (
    SELECT program_variant.id
    FROM public.program_variants program_variant
    WHERE program_variant.program_id = program.id
      AND program_variant.is_active = TRUE
    ORDER BY program_variant.sort_order, program_variant.created_at
    LIMIT 1
  ) variant ON TRUE
  RETURNING id, teacher_id, variant_id, shift_id, day_of_week
)
INSERT INTO public.schedule_placements (class_id, student_id)
SELECT
  inserted.id,
  student.id
FROM inserted_classes inserted
JOIN class_specs spec
  ON spec.day_of_week = inserted.day_of_week
JOIN auth.users auth_user ON auth_user.id = inserted.teacher_id
JOIN public.program_variants variant ON variant.id = inserted.variant_id
JOIN public.programs program ON program.id = variant.program_id
  AND program.initials = spec.program_initials
JOIN public.students student
  ON student.student_number = ANY(spec.student_numbers)
WHERE auth_user.email = spec.teacher_email;

WITH class_rows AS (
  SELECT
    schedule_class.id AS schedule_class_id,
    schedule_class.teacher_id,
    schedule_class.variant_id,
    schedule_class.shift_id,
    schedule_draft.branch_id,
    schedule_class.day_of_week
  FROM public.schedule_classes schedule_class
  JOIN public.schedule_drafts schedule_draft ON schedule_draft.id = schedule_class.draft_id
  WHERE schedule_draft.status = 'active'
), session_rows AS (
  SELECT
    class_row.*,
    day_value::date AS session_date
  FROM class_rows class_row
  CROSS JOIN LATERAL generate_series(
    (date_trunc('month', current_date) - interval '2 months')::date,
    current_date - 1,
    interval '1 day'
  ) day_value
  WHERE EXTRACT(ISODOW FROM day_value)::integer = class_row.day_of_week
), inserted_sessions AS (
  INSERT INTO public.teaching_sessions (
    schedule_class_id,
    teacher_id,
    branch_id,
    shift_id,
    variant_id,
    session_date,
    scheduled_start_time,
    scheduled_end_time,
    status,
    submitted_at
  )
  SELECT
    session_row.schedule_class_id,
    session_row.teacher_id,
    session_row.branch_id,
    session_row.shift_id,
    session_row.variant_id,
    session_row.session_date,
    shift.start_time,
    shift.end_time,
    'submitted',
    now()
  FROM session_rows session_row
  JOIN public.branch_shifts shift ON shift.id = session_row.shift_id
  RETURNING id
)
INSERT INTO public.teaching_session_students (
  session_id,
  student_id,
  attendance_status,
  achievement,
  teacher_note,
  teacher_fee_snapshot
)
SELECT
  teaching_session.id,
  placement.student_id,
  CASE ((EXTRACT(DAY FROM teaching_session.session_date)::integer + placement_number.position) % 4)
    WHEN 0 THEN 'present'
    WHEN 1 THEN 'absent'
    WHEN 2 THEN 'excused'
    ELSE 'cancelled'
  END,
  CASE WHEN placement_number.position % 2 = 0 THEN 'Latihan demo selesai' ELSE NULL END,
  'Fixture teaching note',
  variant.teacher_fee
FROM public.teaching_sessions teaching_session
JOIN public.schedule_placements placement ON placement.class_id = teaching_session.schedule_class_id
JOIN public.program_variants variant ON variant.id = teaching_session.variant_id
CROSS JOIN LATERAL (
  SELECT row_number() OVER (ORDER BY placement_inner.student_id)::integer AS position
  FROM public.schedule_placements placement_inner
  WHERE placement_inner.class_id = teaching_session.schedule_class_id
    AND placement_inner.student_id <= placement.student_id
) placement_number;

INSERT INTO public.payroll_periods (period_month, status)
VALUES
  (date_trunc('month', current_date - interval '2 months')::date, 'open'),
  (date_trunc('month', current_date - interval '1 month')::date, 'open'),
  (date_trunc('month', current_date)::date, 'open');

SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM public.profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1),
  true
);

SELECT public.close_payroll_period(period.id)
FROM public.payroll_periods period
WHERE period.period_month IN (
  date_trunc('month', current_date - interval '2 months')::date,
  date_trunc('month', current_date - interval '1 month')::date
);

SELECT public.add_payroll_adjustment(
  (SELECT id FROM public.payroll_periods WHERE period_month = date_trunc('month', current_date - interval '1 month')::date),
  (SELECT auth_user.id FROM auth.users auth_user WHERE auth_user.email = 'guru.demo.06@uzmacourse.test'),
  50000,
  'Fixture bonus adjustment'
);

SELECT public.add_payroll_adjustment(
  (SELECT id FROM public.payroll_periods WHERE period_month = date_trunc('month', current_date - interval '1 month')::date),
  (SELECT auth_user.id FROM auth.users auth_user WHERE auth_user.email = 'guru.demo.01@uzmacourse.test'),
  -25000,
  'Fixture correction adjustment'
);

SELECT public.mark_payroll_period_paid(
  (SELECT id FROM public.payroll_periods WHERE period_month = date_trunc('month', current_date - interval '2 months')::date)
);

SELECT public.generate_due_student_invoices(NULL);

SELECT public.record_student_payment(
  invoice.id,
  'transfer_bca',
  current_date,
  'DEMO-TRANSFER-' || row_number() OVER (ORDER BY invoice.invoice_number),
  'Fixture paid invoice'
)
FROM (
  SELECT id, invoice_number
  FROM public.student_invoices
  WHERE status = 'unpaid'
  ORDER BY invoice_number
  LIMIT 6
) invoice;

UPDATE public.student_invoices invoice
SET
  status = 'cancelled',
  notes = 'Fixture cancelled invoice',
  updated_at = now()
WHERE invoice.id = (
  SELECT id
  FROM public.student_invoices
  WHERE status = 'unpaid'
  ORDER BY invoice_number
  LIMIT 1
);
