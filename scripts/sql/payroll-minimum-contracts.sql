-- Runner loads owned-financial-fixtures.sql in a rollback-only transaction first.
DO $$
DECLARE
 v_admin uuid := pg_temp.qa_id('admin');
 v_guru uuid := pg_temp.qa_id('guru');
 v_missing uuid := pg_temp.qa_id('missing');
 v_period uuid := pg_temp.qa_id('period');
 v_next uuid := pg_temp.qa_id('next_period');
 v_legacy uuid := pg_temp.qa_id('legacy_period');
 v_failure uuid := pg_temp.qa_id('failure_period');
 v_entry public.payroll_entries;
 v_adj public.payroll_adjustments;
 v_state text;
 v_message text;
 v_role text;
 v_expected record;
 v_before jsonb;
BEGIN
 -- Automatic ledger cannot be forged or edited by an application role.
 FOREACH v_role IN ARRAY ARRAY['anon','authenticated'] LOOP
  ASSERT NOT has_table_privilege(v_role,'public.payroll_adjustments','INSERT'), 'adjustment_direct_insert_denied: ' || v_role;
  ASSERT NOT has_table_privilege(v_role,'public.payroll_adjustments','UPDATE'), 'adjustment_direct_update_denied: ' || v_role;
  ASSERT NOT has_table_privilege(v_role,'public.payroll_adjustments','DELETE'), 'adjustment_direct_delete_denied: ' || v_role;
 END LOOP;
 FOREACH v_role IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
  ASSERT has_function_privilege(v_role,'public.close_payroll_period(uuid)','EXECUTE')=(v_role<>'anon'),'close_effective_execute: ' || v_role;
  ASSERT has_function_privilege(v_role,'public.add_payroll_adjustment(uuid,uuid,integer,text)','EXECUTE')=(v_role<>'anon'),'manual_effective_execute: ' || v_role;
  PERFORM set_config('request.jwt.claim.sub',CASE WHEN v_role='authenticated' THEN v_guru::text ELSE '' END,true);
  EXECUTE format('SET LOCAL ROLE %I',v_role);
  v_state := '00000';
  BEGIN PERFORM public.close_payroll_period(v_period);
  EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
  RESET ROLE;
  ASSERT v_state='42501','unauthorized_close_denied: ' || v_role || ' got ' || v_state;
  EXECUTE format('SET LOCAL ROLE %I',v_role);
  v_state := '00000';
  BEGIN PERFORM public.add_payroll_adjustment(v_period,v_guru,1,'Unauthorized dummy');
  EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
  RESET ROLE;
  ASSERT v_state='42501','unauthorized_manual_denied: ' || v_role || ' got ' || v_state;
 END LOOP;
 ASSERT (SELECT status='open' FROM public.payroll_periods WHERE id=v_period), 'unauthorized_close_unchanged';
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_adjustments WHERE period_id=v_period), 'unauthorized_manual_no_rows';
 PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);
 PERFORM set_config('request.jwt.claim.role','authenticated',true);
 SET LOCAL ROLE authenticated;
 v_state := '00000';
 BEGIN PERFORM public.add_payroll_adjustment(v_period,v_guru,1,'Dummy open-period attempt');
 EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
 RESET ROLE;
 ASSERT v_state='P0001','admin_open_period_manual_rejected';
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_adjustments WHERE period_id=v_period),'admin_open_period_manual_no_rows';
 -- Existing pre-rollout statements are deliberately below their configured minimum.
 UPDATE public.payroll_periods SET status='closed',closed_by=v_admin,closed_at=now() WHERE id=v_legacy;
 INSERT INTO public.payroll_entries(period_id,teacher_id,fee_sessions_total,fixed_allowances_total,minimum_income_snapshot,allowances_snapshot,adjustments_total,total_amount)
 VALUES(v_legacy,v_guru,3000,400000,450000,'[{"name":"Legacy fixed","amount":400000}]',1000,404000);
 INSERT INTO public.payroll_adjustments(period_id,teacher_id,amount,reason,created_by) VALUES(v_legacy,v_guru,1000,'Legacy manual',v_admin);
 SELECT to_jsonb(pe) INTO v_before FROM public.payroll_entries pe WHERE period_id=v_legacy AND teacher_id=v_guru;
 SET LOCAL ROLE authenticated;
 PERFORM public.close_payroll_period(v_period);
 RESET ROLE;
 SELECT * INTO STRICT v_entry FROM public.payroll_entries WHERE period_id=v_period AND teacher_id=v_guru;
 ASSERT v_entry.fee_sessions_total=3000 AND v_entry.fixed_allowances_total=400000 AND v_entry.minimum_income_snapshot=450000, 'earned_3000_allowance_400000_snapshots';
 ASSERT (SELECT count(*) FROM public.payroll_session_lines WHERE period_id=v_period AND teacher_id=v_guru AND payable_amount=3000)=1, 'earned_fee_is_actual_submitted_session';
 SELECT * INTO STRICT v_adj FROM public.payroll_adjustments WHERE period_id=v_period AND teacher_id=v_guru AND kind='minimum_income_topup';
 ASSERT v_adj.amount=47000 AND v_adj.reason='Top-up Garansi Gaji Minimum' AND v_adj.created_by=v_admin, 'topup_47000_positive_typed_attributed';
 ASSERT v_entry.total_amount=450000 AND v_entry.adjustments_total=47000, 'closing_total_450000';
 ASSERT (SELECT status='closed' AND closed_by=v_admin FROM public.payroll_periods WHERE id=v_period), 'closing_admin_attribution';
 -- A teacher statement needs the period as well as its owned ledger rows.
 PERFORM set_config('request.jwt.claim.sub',v_guru::text,true);
 SET LOCAL ROLE authenticated;
 ASSERT (SELECT count(*) FROM public.payroll_periods WHERE id=v_period)=1, 'teacher_reads_own_closed_period';
 ASSERT (SELECT total_amount FROM public.payroll_entries WHERE period_id=v_period AND teacher_id=v_guru)=450000, 'teacher_reads_own_closed_total';
 ASSERT (SELECT amount FROM public.payroll_adjustments WHERE id=v_adj.id)=47000, 'teacher_reads_own_automatic_adjustment';
 RESET ROLE;
 PERFORM set_config('request.jwt.claim.sub',v_missing::text,true);
 SET LOCAL ROLE authenticated;
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_periods WHERE id=v_period), 'teacher_without_entry_cannot_read_foreign_closed_period';
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_entries WHERE period_id=v_period AND teacher_id=v_guru), 'teacher_cannot_read_foreign_closed_entry';
 ASSERT (SELECT count(*) FROM public.payroll_periods WHERE id=v_next)=1, 'open_period_visibility_preserved';
 RESET ROLE;
 PERFORM set_config('request.jwt.claim.sub',v_admin::text,true);
 FOR v_expected IN SELECT * FROM (VALUES
  ('equal',450000,0,450000),('above',500000,0,500000),('disabled',400000,0,400000),('no_income',0,450000,450000),('inactive_earned',403000,47000,450000)
 ) expectations(key,base,topup,total) LOOP
  SELECT * INTO STRICT v_entry FROM public.payroll_entries WHERE period_id=v_period AND teacher_id=pg_temp.qa_id(v_expected.key);
  ASSERT v_entry.fee_sessions_total+v_entry.fixed_allowances_total=v_expected.base AND v_entry.total_amount=v_expected.total, 'eligibility_boundary_total: ' || v_expected.key;
  ASSERT (SELECT COALESCE(sum(amount),0) FROM public.payroll_adjustments WHERE period_id=v_period AND teacher_id=pg_temp.qa_id(v_expected.key) AND kind='minimum_income_topup')=v_expected.topup, 'eligibility_boundary_topup: ' || v_expected.key;
  ASSERT (SELECT count(*) FROM public.payroll_adjustments WHERE period_id=v_period AND teacher_id=pg_temp.qa_id(v_expected.key) AND kind='minimum_income_topup')=CASE WHEN v_expected.topup>0 THEN 1 ELSE 0 END, 'eligibility_no_zero_rows: ' || v_expected.key;
 END LOOP;
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_entries WHERE period_id=v_period AND teacher_id=pg_temp.qa_id('inactive')), 'inactive_no_income_not_eligible';
 -- Valid existing guru, deliberately ineligible, has NO entry. Wrong FK errors cannot satisfy this contract.
 SET LOCAL ROLE authenticated;
 v_state := '00000'; v_message := NULL;
 BEGIN PERFORM public.add_payroll_adjustment(v_period,v_missing,10000,'Dummy missing entry');
 EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE,v_message=MESSAGE_TEXT; END;
 RESET ROLE;
 ASSERT v_state='P0002' AND v_message='Guru tidak memiliki entri payroll pada periode ini.', 'missing_existing_entry_exact_P0002: got ' || v_state || ' ' || coalesce(v_message,'');
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_adjustments WHERE period_id=v_period AND teacher_id=v_missing), 'missing_existing_entry_atomic_no_adjustment';
 SET LOCAL ROLE authenticated;
 PERFORM public.add_payroll_adjustment(v_period,v_guru,-25000,'Dummy deduction');
 RESET ROLE;
 SELECT * INTO STRICT v_entry FROM public.payroll_entries WHERE period_id=v_period AND teacher_id=v_guru;
 ASSERT v_entry.total_amount=425000 AND v_entry.adjustments_total=22000, 'manual_deduction_425000_not_rebalanced';
 ASSERT (SELECT amount=47000 FROM public.payroll_adjustments WHERE id=v_adj.id), 'manual_deduction_subsidy_unchanged';
 ASSERT (SELECT count(*) FROM public.payroll_adjustments WHERE period_id=v_period AND teacher_id=v_guru AND kind='manual' AND amount=-25000 AND created_by=v_admin)=1,'manual_kind_and_attribution';
 -- Real constraint violations must abort their own subtransaction.
 v_state := '00000';
 BEGIN INSERT INTO public.payroll_adjustments(period_id,teacher_id,amount,reason,created_by,kind) VALUES(v_period,v_guru,1,'Duplicate',v_admin,'minimum_income_topup');
 EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
 ASSERT v_state='23505','automatic_unique_kind_enforced';
 v_state := '00000';
 BEGIN INSERT INTO public.payroll_adjustments(period_id,teacher_id,amount,reason,created_by,kind) VALUES(v_period,v_missing,-1,'Negative automatic',v_admin,'minimum_income_topup');
 EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
 ASSERT v_state='23514','automatic_positive_kind_enforced';
 SET LOCAL ROLE authenticated;
 v_state := '00000';
 BEGIN PERFORM public.close_payroll_period(v_period);
 EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
 RESET ROLE;
 ASSERT v_state='P0001','repeat_close_domain_rejection';
 UPDATE public.profiles SET minimum_income=0,allowances='[{"name":"Future fixed","amount":12345}]' WHERE id=v_guru;
 SET LOCAL ROLE authenticated;
 PERFORM public.close_payroll_period(v_next);
 RESET ROLE;
 ASSERT (SELECT minimum_income_snapshot=0 AND fixed_allowances_total=12345 AND total_amount=12345 FROM public.payroll_entries WHERE period_id=v_next AND teacher_id=v_guru),'zero_minimum_only_next_period';
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_adjustments WHERE period_id=v_next AND teacher_id=v_guru AND kind='minimum_income_topup'),'zero_minimum_next_period_no_subsidy';
 ASSERT (SELECT minimum_income_snapshot=450000 AND fixed_allowances_total=400000 AND total_amount=425000 FROM public.payroll_entries WHERE period_id=v_period AND teacher_id=v_guru),'closed_snapshots_immutable_after_profile_edit';
 ASSERT (SELECT to_jsonb(pe)=v_before FROM public.payroll_entries pe WHERE period_id=v_legacy AND teacher_id=v_guru),'legacy_snapshot_not_backfilled';
 ASSERT (SELECT kind='manual' FROM public.payroll_adjustments WHERE period_id=v_legacy AND teacher_id=v_guru),'legacy_manual_default_preserved';
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_adjustments WHERE period_id=v_legacy AND kind='minimum_income_topup'),'legacy_no_automatic_backfill';
 -- Paid entries reject manual adjustments and reclose as explicit domain failures.
 SET LOCAL ROLE authenticated;
 PERFORM public.mark_payroll_period_paid(v_period);
 v_state := '00000';
 BEGIN PERFORM public.add_payroll_adjustment(v_period,v_guru,1,'Dummy paid attempt');
 EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
 RESET ROLE;
 ASSERT v_state='P0001','paid_entry_manual_rejected';
 -- Inject an unexpected pre-existing automatic row: close MUST fail, not silently suppress it.
 UPDATE public.profiles SET minimum_income=450000,allowances='[{"name":"Dummy fixed","amount":400000}]' WHERE id=v_guru;
 INSERT INTO public.payroll_adjustments(period_id,teacher_id,amount,reason,created_by,kind) VALUES(v_failure,v_guru,123,'Injected duplicate failure',v_admin,'minimum_income_topup');
 -- A second owned submitted source proves failed close rolls session lines back too.
 INSERT INTO public.teaching_sessions(schedule_class_id,teacher_id,branch_id,shift_id,variant_id,session_date,scheduled_start_time,scheduled_end_time,status,submitted_at)
 SELECT schedule_class_id,teacher_id,branch_id,shift_id,variant_id,(SELECT fixture_month+1 FROM pg_temp.qa_financial_months WHERE key='failure_period'),scheduled_start_time,scheduled_end_time,status,submitted_at FROM public.teaching_sessions WHERE id=pg_temp.qa_id('session');
 INSERT INTO public.teaching_session_students(session_id,student_id,attendance_status,teacher_fee_snapshot)
 SELECT id,pg_temp.qa_id('student'),'present',3000 FROM public.teaching_sessions WHERE schedule_class_id=pg_temp.qa_id('class') AND session_date=(SELECT fixture_month+1 FROM pg_temp.qa_financial_months WHERE key='failure_period');
 SET LOCAL ROLE authenticated;
 v_state := '00000';
 BEGIN PERFORM public.close_payroll_period(v_failure);
 EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS v_state=RETURNED_SQLSTATE; END;
 RESET ROLE;
 ASSERT v_state='23505','injected_duplicate_close_must_fail: got ' || v_state;
 ASSERT (SELECT status='open' AND closed_at IS NULL AND closed_by IS NULL FROM public.payroll_periods WHERE id=v_failure),'failed_close_status_rolled_back';
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_session_lines WHERE period_id=v_failure),'failed_close_session_lines_rolled_back';
 ASSERT NOT EXISTS(SELECT 1 FROM public.payroll_entries WHERE period_id=v_failure),'failed_close_entries_rolled_back';
 ASSERT (SELECT count(*) FROM public.payroll_adjustments WHERE period_id=v_failure)=1 AND (SELECT amount=123 FROM public.payroll_adjustments WHERE period_id=v_failure),'failed_close_adjustments_rolled_back';
END $$;
