-- Owned, randomized fixtures. Caller MUST roll back or delete this exact manifest.
CREATE TEMP TABLE qa_financial_ids (key text PRIMARY KEY, id uuid NOT NULL) ON COMMIT PRESERVE ROWS;
INSERT INTO qa_financial_ids SELECT key, gen_random_uuid() FROM unnest(ARRAY[
 'branch','admin','guru','equal','above','disabled','no_income','inactive','inactive_earned','missing',
 'program','variant','student','shift','draft','class','session','session_student',
 'inactive_class','inactive_session','inactive_session_student','period','next_period','legacy_period','failure_period'
]) key;
GRANT SELECT ON qa_financial_ids TO anon, authenticated, service_role;
CREATE FUNCTION pg_temp.qa_id(p_key text) RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT id FROM pg_temp.qa_financial_ids WHERE key = p_key $$;
CREATE TEMP TABLE qa_financial_months (key text PRIMARY KEY, fixture_month date NOT NULL);
-- Random, unused future months cannot overlap operational teaching sessions.
INSERT INTO qa_financial_months
SELECT key, fixture_month FROM (
 SELECT fixture_month, row_number() OVER (ORDER BY fixture_month) n FROM (
  SELECT (DATE '4000-01-01' + (n || ' months')::interval)::date AS fixture_month
  FROM generate_series((random()*20000)::integer, 71999) n
 ) candidates WHERE NOT EXISTS (SELECT 1 FROM public.payroll_periods p WHERE p.period_month = candidates.fixture_month)
 LIMIT 4
) available JOIN (VALUES ('period',1),('next_period',2),('legacy_period',3),('failure_period',4)) names(key,n) USING(n);
DO $$ BEGIN
 ASSERT (SELECT count(*) FROM pg_temp.qa_financial_months) = 4, 'fixture precondition: four unused months required';
END $$;
INSERT INTO public.branches(id,name) VALUES ('qa-' || pg_temp.qa_id('branch'), 'Dummy financial contract branch');
INSERT INTO auth.users(id,email,raw_user_meta_data)
SELECT id, id || '@financial-contract.invalid', jsonb_build_object('full_name','Dummy financial ' || key,'role',CASE WHEN key='admin' THEN 'admin' ELSE 'guru' END)
FROM qa_financial_ids WHERE key IN ('admin','guru','equal','above','disabled','no_income','inactive','inactive_earned','missing');
UPDATE public.profiles p SET branch_id='qa-' || pg_temp.qa_id('branch'),
 role = CASE WHEN ids.key='admin' THEN 'admin' ELSE 'guru' END,
 is_active = ids.key NOT IN ('inactive','missing','inactive_earned'),
 allowances = CASE ids.key WHEN 'equal' THEN '[{"name":"Dummy fixed","amount":450000}]'::jsonb
 WHEN 'above' THEN '[{"name":"Dummy fixed","amount":500000}]'::jsonb
 WHEN 'no_income' THEN '[]'::jsonb ELSE '[{"name":"Dummy fixed","amount":400000}]'::jsonb END,
 minimum_income=CASE WHEN ids.key='disabled' THEN 0 ELSE 450000 END
FROM qa_financial_ids ids WHERE p.id=ids.id AND ids.key IN ('admin','guru','equal','above','disabled','no_income','inactive','inactive_earned','missing');
INSERT INTO public.programs(id,initials,name) VALUES(pg_temp.qa_id('program'),'QA-' || pg_temp.qa_id('program'),'Dummy financial program');
INSERT INTO public.program_variants(id,program_id,name,teacher_fee) VALUES(pg_temp.qa_id('variant'),pg_temp.qa_id('program'),'Dummy financial variant',3000);
INSERT INTO public.students(id,full_name,parent_name,parent_phone,branch_id) VALUES(pg_temp.qa_id('student'),'Dummy financial pupil','Dummy parent','0000000000','qa-' || pg_temp.qa_id('branch'));
INSERT INTO public.student_programs(student_id,program_id,variant_id,spp_amount,cycle_start_date,cycle_days)
VALUES(pg_temp.qa_id('student'),pg_temp.qa_id('program'),pg_temp.qa_id('variant'),150000,CURRENT_DATE,28);
INSERT INTO public.branch_shifts(id,branch_id,name,start_time,end_time) VALUES(pg_temp.qa_id('shift'),'qa-' || pg_temp.qa_id('branch'),'Dummy slot','08:00','09:00');
INSERT INTO public.schedule_drafts(id,branch_id,name,status) VALUES(pg_temp.qa_id('draft'),'qa-' || pg_temp.qa_id('branch'),'Dummy archived draft','archived');
INSERT INTO public.schedule_classes(id,draft_id,shift_id,variant_id,teacher_id,day_of_week,start_time,end_time)
SELECT pg_temp.qa_id(class_key),pg_temp.qa_id('draft'),pg_temp.qa_id('shift'),pg_temp.qa_id('variant'),pg_temp.qa_id(teacher_key),1,'08:00','08:30'
FROM (VALUES('class','guru'),('inactive_class','inactive_earned')) x(class_key,teacher_key);
INSERT INTO public.teaching_sessions(id,schedule_class_id,teacher_id,branch_id,shift_id,variant_id,session_date,scheduled_start_time,scheduled_end_time,status,submitted_at)
SELECT pg_temp.qa_id(session_key),pg_temp.qa_id(class_key),pg_temp.qa_id(teacher_key),'qa-' || pg_temp.qa_id('branch'),pg_temp.qa_id('shift'),pg_temp.qa_id('variant'),
 (SELECT fixture_month FROM qa_financial_months WHERE key='period'),'08:00','08:30','submitted',now()
FROM (VALUES('session','class','guru'),('inactive_session','inactive_class','inactive_earned')) x(session_key,class_key,teacher_key);
INSERT INTO public.teaching_session_students(id,session_id,student_id,attendance_status,teacher_fee_snapshot)
SELECT pg_temp.qa_id(line_key),pg_temp.qa_id(session_key),pg_temp.qa_id('student'),'present',3000
FROM (VALUES('session_student','session'),('inactive_session_student','inactive_session')) x(line_key,session_key);
INSERT INTO public.payroll_periods(id,period_month) SELECT ids.id,m.fixture_month FROM qa_financial_ids ids JOIN qa_financial_months m USING(key);
