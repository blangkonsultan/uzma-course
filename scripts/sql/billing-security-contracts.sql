-- Runner loads owned-financial-fixtures.sql in a rollback-only transaction first.
DO $$
DECLARE
 v_admin uuid := pg_temp.qa_id('admin');
 v_guru uuid := pg_temp.qa_id('guru');
 v_branch text := 'qa-' || pg_temp.qa_id('branch');
 v_student uuid := pg_temp.qa_id('student');
 v_invoice uuid;
 v_payment public.student_payments;
 v_role text;
 v_state text;
 v_count integer;
 v_case text;
BEGIN
 -- Effective grants, not ACL/source-string approximations.
 FOREACH v_role IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
  ASSERT has_function_privilege(v_role,'public.generate_due_student_invoices(text)','EXECUTE') = (v_role <> 'anon'), 'billing_execute_privilege_generation: ' || v_role;
  ASSERT has_function_privilege(v_role,'public.record_student_payment(uuid,text,date,text,text)','EXECUTE') = (v_role <> 'anon'), 'billing_execute_privilege_payment: ' || v_role;
 END LOOP;
 PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);
 SET LOCAL ROLE authenticated;
 SELECT count(*) INTO v_count FROM public.generate_due_student_invoices(v_branch);
 RESET ROLE;
 ASSERT v_count=1, 'admin_generation_creates_owned_invoice';
 SELECT id INTO STRICT v_invoice FROM public.student_invoices WHERE student_id=v_student;
 ASSERT (SELECT created_by=v_admin AND amount=150000 AND total_amount=150000 AND due_date=CURRENT_DATE+7 AND cycle_number=1 FROM public.student_invoices WHERE id=v_invoice), 'admin_generation_values_and_attribution';
 SET LOCAL ROLE authenticated;
 SELECT count(*) INTO v_count FROM public.generate_due_student_invoices(v_branch);
 RESET ROLE;
 ASSERT v_count=0 AND (SELECT count(*) FROM public.student_invoices WHERE student_id=v_student)=1, 'admin_generation_idempotent';

 FOREACH v_role IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
  v_case := CASE v_role WHEN 'anon' THEN 'anonymous' WHEN 'authenticated' THEN 'guru' ELSE 'uidless_service' END;
  PERFORM set_config('request.jwt.claim.sub',CASE WHEN v_role='authenticated' THEN v_guru::text ELSE '' END,true);
  PERFORM set_config('request.jwt.claim.role',v_role,true);
  EXECUTE format('SET LOCAL ROLE %I',v_role);
  v_state := '00000';
  BEGIN PERFORM public.generate_due_student_invoices(v_branch);
  EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
  RESET ROLE;
  ASSERT v_state='42501',v_case || '_generation_denied: expected 42501, got ' || v_state;
  ASSERT (SELECT count(*) FROM public.student_invoices WHERE student_id=v_student)=1, v_case || '_generation_no_side_effects';
  EXECUTE format('SET LOCAL ROLE %I',v_role);
  v_state := '00000';
  BEGIN PERFORM public.record_student_payment(v_invoice,'cash',CURRENT_DATE,NULL,'Unauthorized dummy attempt');
  EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
  RESET ROLE;
  ASSERT v_state='42501',v_case || '_payment_denied: expected 42501, got ' || v_state;
  ASSERT NOT EXISTS(SELECT 1 FROM public.student_payments WHERE invoice_id=v_invoice), v_case || '_payment_no_receipt';
  ASSERT (SELECT status='unpaid' FROM public.student_invoices WHERE id=v_invoice),v_case || '_payment_no_status_change';
 END LOOP;
 PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);
 PERFORM set_config('request.jwt.claim.role','authenticated',true);
 SET LOCAL ROLE authenticated;
 v_payment := public.record_student_payment(v_invoice,'cash',CURRENT_DATE,'Dummy reference','Dummy admin note');
 RESET ROLE;
 ASSERT v_payment.received_by=v_admin AND v_payment.amount_paid=150000 AND v_payment.payment_reference='Dummy reference' AND v_payment.notes='Dummy admin note', 'admin_full_payment_attribution';
 ASSERT v_payment.receipt_number ~ '^RCT-[0-9]{4}-[0-9]{4}$', 'admin_receipt_number_shape';
 ASSERT (SELECT status='paid' FROM public.student_invoices WHERE id=v_invoice), 'admin_payment_marks_paid';
 SET LOCAL ROLE authenticated;
 v_state := '00000';
 BEGIN PERFORM public.record_student_payment(v_invoice,'cash',CURRENT_DATE,NULL,NULL);
 EXCEPTION
 WHEN SQLSTATE 'P0004' THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE;
 WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE;
 END;
 RESET ROLE;
 ASSERT v_state='P0004','admin_payment_replay_rejected: expected P0004, got ' || v_state;
 ASSERT (SELECT count(*) FROM public.student_payments WHERE invoice_id=v_invoice)=1, 'admin_payment_replay_no_duplicate';
 ASSERT (SELECT id=v_payment.id AND received_by=v_admin AND amount_paid=150000 FROM public.student_payments WHERE invoice_id=v_invoice), 'admin_payment_replay_preserves_receipt';
END $$;
