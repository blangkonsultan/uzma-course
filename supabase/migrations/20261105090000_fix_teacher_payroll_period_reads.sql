-- Qualify the outer period ID: an unqualified id inside the subquery resolves
-- to payroll_entries.id and hides valid closed/paid statements from their owner.
-- Preserve existing open-period visibility, grants, and the separate admin policy.
DROP POLICY "Guru reads payroll periods" ON public.payroll_periods;

CREATE POLICY "Guru reads payroll periods"
    ON public.payroll_periods FOR SELECT
    USING (
        status = 'open'
        OR EXISTS (
            SELECT 1
            FROM public.payroll_entries pe
            WHERE pe.period_id = public.payroll_periods.id
              AND pe.teacher_id = auth.uid()
        )
    );
