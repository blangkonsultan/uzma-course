-- Migration: 20261104091000_authorize_teacher_overdue_summaries.sql
-- Goal: Revoke broad teacher SELECT policies on student_invoices and student_payments (SEC-02),
-- provide get_teacher_overdue_spp(p_class_ids uuid[]) RPC for aggregate past-due debt by active class,
-- and get_teacher_class_students(p_class_ids uuid[]) for minimal roster access.

-- 1. Drop broad teacher SELECT policies on student_invoices and student_payments
DROP POLICY IF EXISTS "Guru reads branch student_invoices" ON public.student_invoices;
DROP POLICY IF EXISTS "Guru reads branch student_payments" ON public.student_payments;

-- 2. Create get_teacher_overdue_spp RPC
-- Aggregates past-due unpaid invoices inside PostgreSQL for active classes owned by auth.uid().
CREATE OR REPLACE FUNCTION public.get_teacher_overdue_spp(p_class_ids UUID[])
RETURNS TABLE(
    class_id UUID,
    student_id UUID,
    program_id UUID,
    due_date DATE,
    total_amount BIGINT,
    invoice_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
    v_today DATE;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = v_user_id AND role = 'guru'
    ) THEN
        RAISE EXCEPTION 'Hanya guru terautentikasi yang dapat mengakses ringkasan SPP murid.' USING ERRCODE = '42501';
    END IF;

    IF p_class_ids IS NULL OR array_length(p_class_ids, 1) = 0 THEN
        RETURN;
    END IF;

    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::DATE;

    RETURN QUERY
    WITH requested_classes AS (
        SELECT DISTINCT unnest(p_class_ids) AS req_class_id
    ),
    authorized_pairs AS (
        SELECT DISTINCT
            sc.id AS auth_class_id,
            sp.student_id AS auth_student_id,
            pv.program_id AS auth_program_id
        FROM requested_classes rc
        JOIN public.schedule_classes sc ON sc.id = rc.req_class_id
        JOIN public.schedule_drafts sd ON sd.id = sc.draft_id
        JOIN public.program_variants pv ON pv.id = sc.variant_id
        JOIN public.schedule_placements sp ON sp.class_id = sc.id
        WHERE sc.teacher_id = v_user_id
          AND sd.status = 'active'
    )
    SELECT
        ap.auth_class_id AS class_id,
        ap.auth_student_id AS student_id,
        ap.auth_program_id AS program_id,
        MIN(inv.due_date) AS due_date,
        COALESCE(SUM(inv.total_amount), 0)::BIGINT AS total_amount,
        COUNT(inv.id)::BIGINT AS invoice_count
    FROM authorized_pairs ap
    JOIN public.student_invoices inv
      ON inv.student_id = ap.auth_student_id
     AND inv.program_id = ap.auth_program_id
     AND inv.status = 'unpaid'
     AND inv.due_date < v_today
    GROUP BY ap.auth_class_id, ap.auth_student_id, ap.auth_program_id
    ORDER BY ap.auth_class_id, ap.auth_student_id, ap.auth_program_id;
END;
$$;

-- 3. Create get_teacher_class_students RPC
-- Minimal roster read for owned classes (active or historical).
CREATE OR REPLACE FUNCTION public.get_teacher_class_students(p_class_ids UUID[])
RETURNS TABLE(
    class_id UUID,
    student_id UUID,
    full_name TEXT,
    student_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = v_user_id AND role = 'guru'
    ) THEN
        RAISE EXCEPTION 'Hanya guru terautentikasi yang dapat mengakses data murid kelas.' USING ERRCODE = '42501';
    END IF;

    IF p_class_ids IS NULL OR array_length(p_class_ids, 1) = 0 THEN
        RETURN;
    END IF;

    RETURN QUERY
    WITH requested_classes AS (
        SELECT DISTINCT unnest(p_class_ids) AS req_class_id
    ),
    authorized_classes AS (
        SELECT sc.id AS auth_class_id
        FROM requested_classes rc
        JOIN public.schedule_classes sc ON sc.id = rc.req_class_id
        WHERE sc.teacher_id = v_user_id
    )
    SELECT DISTINCT
        ac.auth_class_id AS class_id,
        s.id AS student_id,
        s.full_name::TEXT,
        s.student_number::TEXT
    FROM authorized_classes ac
    JOIN public.schedule_placements sp ON sp.class_id = ac.auth_class_id
    JOIN public.students s ON s.id = sp.student_id
    ORDER BY ac.auth_class_id, s.full_name::TEXT;
END;
$$;

-- 4. Revoke EXECUTE from PUBLIC and anon; grant only authenticated and service_role
REVOKE EXECUTE ON FUNCTION public.get_teacher_overdue_spp(UUID[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_teacher_class_students(UUID[]) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_teacher_overdue_spp(UUID[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_teacher_class_students(UUID[]) TO authenticated, service_role;
