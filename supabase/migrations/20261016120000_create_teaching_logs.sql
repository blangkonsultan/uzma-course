-- Phase 2b: Teaching Log & Student Session Cards

CREATE TABLE IF NOT EXISTS public.teaching_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_class_id UUID NOT NULL REFERENCES public.schedule_classes(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    shift_id UUID NOT NULL REFERENCES public.branch_shifts(id) ON DELETE RESTRICT,
    variant_id UUID NOT NULL REFERENCES public.program_variants(id) ON DELETE RESTRICT,
    session_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    scheduled_end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT teaching_sessions_date_status_check CHECK (
        (status = 'draft' AND submitted_at IS NULL)
        OR (status = 'submitted' AND submitted_at IS NOT NULL)
    ),
    CONSTRAINT teaching_sessions_class_date_unique UNIQUE (schedule_class_id, session_date)
);

CREATE INDEX IF NOT EXISTS idx_teaching_sessions_teacher_date
    ON public.teaching_sessions (teacher_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_teaching_sessions_class_date
    ON public.teaching_sessions (schedule_class_id, session_date DESC);

CREATE TABLE IF NOT EXISTS public.teaching_session_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.teaching_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    attendance_status TEXT CHECK (
        attendance_status IS NULL
        OR attendance_status IN ('present', 'absent', 'excused', 'cancelled')
    ),
    achievement TEXT,
    teacher_note TEXT,
    teacher_fee_snapshot INTEGER NOT NULL CHECK (teacher_fee_snapshot >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT teaching_session_students_unique UNIQUE (session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_teaching_session_students_student
    ON public.teaching_session_students (student_id, session_id);

DROP TRIGGER IF EXISTS teaching_sessions_updated_at ON public.teaching_sessions;
CREATE TRIGGER teaching_sessions_updated_at
    BEFORE UPDATE ON public.teaching_sessions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS teaching_session_students_updated_at ON public.teaching_session_students;
CREATE TRIGGER teaching_session_students_updated_at
    BEFORE UPDATE ON public.teaching_session_students
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.teaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_session_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages teaching sessions"
    ON public.teaching_sessions FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Guru reads own teaching sessions"
    ON public.teaching_sessions FOR SELECT
    USING (teacher_id = auth.uid());

CREATE POLICY "Guru inserts own teaching sessions"
    ON public.teaching_sessions FOR INSERT
    WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Guru updates own draft teaching sessions"
    ON public.teaching_sessions FOR UPDATE
    USING (teacher_id = auth.uid() AND status = 'draft')
    WITH CHECK (teacher_id = auth.uid() AND status = 'draft');

CREATE POLICY "Admin manages teaching session students"
    ON public.teaching_session_students FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Guru reads own teaching session students"
    ON public.teaching_session_students FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.teaching_sessions ts
            WHERE ts.id = session_id
              AND ts.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Guru inserts own draft teaching session students"
    ON public.teaching_session_students FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.teaching_sessions ts
            WHERE ts.id = session_id
              AND ts.teacher_id = auth.uid()
              AND ts.status = 'draft'
        )
    );

CREATE POLICY "Guru updates own draft teaching session students"
    ON public.teaching_session_students FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.teaching_sessions ts
            WHERE ts.id = session_id
              AND ts.teacher_id = auth.uid()
              AND ts.status = 'draft'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.teaching_sessions ts
            WHERE ts.id = session_id
              AND ts.teacher_id = auth.uid()
              AND ts.status = 'draft'
        )
    );

-- Existing schedule-draft policy only covered a teacher's primary branch.
-- Include profile_branches so secondary-branch teachers can resolve their assigned classes.
DROP POLICY IF EXISTS "Guru reads active drafts" ON public.schedule_drafts;
CREATE POLICY "Guru reads active drafts"
    ON public.schedule_drafts FOR SELECT
    USING (
        (
            status = 'active'
            AND (
                branch_id IN (
                    SELECT p.branch_id
                    FROM public.profiles p
                    WHERE p.id = auth.uid()
                      AND p.branch_id IS NOT NULL
                )
                OR branch_id IN (
                    SELECT pb.branch_id
                    FROM public.profile_branches pb
                    WHERE pb.profile_id = auth.uid()
                )
            )
        )
        OR EXISTS (
            SELECT 1
            FROM public.schedule_classes sc
            WHERE sc.draft_id = public.schedule_drafts.id
              AND sc.teacher_id = auth.uid()
        )
    );

CREATE OR REPLACE FUNCTION public.save_teaching_session(
    p_schedule_class_id UUID,
    p_session_date DATE,
    p_students JSONB
)
RETURNS public.teaching_sessions
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_class public.schedule_classes%ROWTYPE;
    v_session public.teaching_sessions%ROWTYPE;
    v_item JSONB;
    v_student_id UUID;
    v_status TEXT;
    v_placement_count INTEGER;
    v_distinct_student_count INTEGER;
    v_today_wib DATE := (timezone('Asia/Jakarta', now()))::DATE;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Sesi guru tidak valid.' USING ERRCODE = 'P0001';
    END IF;

    IF jsonb_typeof(p_students) <> 'array' THEN
        RAISE EXCEPTION 'Daftar murid tidak valid.' USING ERRCODE = 'P0001';
    END IF;

    SELECT sc.*
    INTO v_class
    FROM public.schedule_classes sc
    JOIN public.schedule_drafts sd ON sd.id = sc.draft_id
    WHERE sc.id = p_schedule_class_id
      AND sc.teacher_id = v_user_id
      AND sd.status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Kelas tidak ditemukan atau bukan jadwal guru ini.' USING ERRCODE = 'P0001';
    END IF;

    IF p_session_date > v_today_wib THEN
        RAISE EXCEPTION 'Tanggal sesi tidak boleh berada di masa depan.' USING ERRCODE = 'P0001';
    END IF;

    IF EXTRACT(ISODOW FROM p_session_date)::INTEGER <> v_class.day_of_week THEN
        RAISE EXCEPTION 'Tanggal sesi tidak sesuai hari jadwal kelas.' USING ERRCODE = 'P0001';
    END IF;

    SELECT COUNT(*)::INTEGER
    INTO v_placement_count
    FROM public.schedule_placements sp
    WHERE sp.class_id = v_class.id;

    SELECT COUNT(DISTINCT (item->>'student_id')::UUID)::INTEGER
    INTO v_distinct_student_count
    FROM jsonb_array_elements(p_students) AS item;

    IF jsonb_array_length(p_students) <> v_placement_count
       OR v_distinct_student_count <> v_placement_count THEN
        RAISE EXCEPTION 'Daftar murid sesi tidak sesuai dengan penempatan kelas.' USING ERRCODE = 'P0001';
    END IF;

    SELECT *
    INTO v_session
    FROM public.teaching_sessions ts
    WHERE ts.schedule_class_id = v_class.id
      AND ts.session_date = p_session_date
    FOR UPDATE;

    IF FOUND THEN
        IF v_session.status <> 'draft' THEN
            RAISE EXCEPTION 'Kartu mengajar yang sudah dikirim tidak dapat diubah.' USING ERRCODE = 'P0001';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM public.teaching_session_students tss
            WHERE tss.session_id = v_session.id
              AND NOT EXISTS (
                  SELECT 1
                  FROM public.schedule_placements sp
                  WHERE sp.class_id = v_class.id
                    AND sp.student_id = tss.student_id
              )
        ) THEN
            RAISE EXCEPTION 'Penempatan murid kelas berubah; kartu draft perlu ditinjau Admin.' USING ERRCODE = 'P0001';
        END IF;

        UPDATE public.teaching_sessions
        SET updated_at = now()
        WHERE id = v_session.id
        RETURNING * INTO v_session;
    ELSE
        INSERT INTO public.teaching_sessions (
            schedule_class_id,
            teacher_id,
            branch_id,
            shift_id,
            variant_id,
            session_date,
            scheduled_start_time,
            scheduled_end_time
        )
        SELECT
            v_class.id,
            v_class.teacher_id,
            sd.branch_id,
            v_class.shift_id,
            v_class.variant_id,
            p_session_date,
            v_class.start_time,
            v_class.end_time
        FROM public.schedule_drafts sd
        WHERE sd.id = v_class.draft_id
        RETURNING * INTO v_session;
    END IF;

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_students) AS value LOOP
        IF v_item->>'student_id' IS NULL THEN
            RAISE EXCEPTION 'ID murid wajib diisi.' USING ERRCODE = 'P0001';
        END IF;

        v_student_id := (v_item->>'student_id')::UUID;
        v_status := NULLIF(v_item->>'attendance_status', '');

        IF v_status IS NOT NULL
           AND v_status NOT IN ('present', 'absent', 'excused', 'cancelled') THEN
            RAISE EXCEPTION 'Status kehadiran murid tidak valid.' USING ERRCODE = 'P0001';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM public.schedule_placements sp
            WHERE sp.class_id = v_class.id
              AND sp.student_id = v_student_id
        ) THEN
            RAISE EXCEPTION 'Murid bukan bagian dari penempatan kelas ini.' USING ERRCODE = 'P0001';
        END IF;

        INSERT INTO public.teaching_session_students (
            session_id,
            student_id,
            attendance_status,
            achievement,
            teacher_note,
            teacher_fee_snapshot
        )
        SELECT
            v_session.id,
            v_student_id,
            v_status,
            NULLIF(v_item->>'achievement', ''),
            NULLIF(v_item->>'teacher_note', ''),
            pv.teacher_fee
        FROM public.program_variants pv
        WHERE pv.id = v_class.variant_id
        ON CONFLICT (session_id, student_id) DO UPDATE
        SET attendance_status = EXCLUDED.attendance_status,
            achievement = EXCLUDED.achievement,
            teacher_note = EXCLUDED.teacher_note,
            updated_at = now();
    END LOOP;

    RETURN v_session;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_teaching_session(
    p_session_id UUID
)
RETURNS public.teaching_sessions
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_session public.teaching_sessions%ROWTYPE;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Sesi guru tidak valid.' USING ERRCODE = 'P0001';
    END IF;

    SELECT *
    INTO v_session
    FROM public.teaching_sessions ts
    WHERE ts.id = p_session_id
    FOR UPDATE;

    IF NOT FOUND OR v_session.teacher_id <> v_user_id THEN
        RAISE EXCEPTION 'Kartu mengajar tidak ditemukan.' USING ERRCODE = 'P0001';
    END IF;

    IF v_session.status <> 'draft' THEN
        RAISE EXCEPTION 'Kartu mengajar sudah dikirim.' USING ERRCODE = 'P0001';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.teaching_session_students tss
        WHERE tss.session_id = v_session.id
          AND tss.attendance_status IS NULL
    ) THEN
        RAISE EXCEPTION 'Status semua murid wajib diisi sebelum mengirim kartu.' USING ERRCODE = 'P0001';
    END IF;

    UPDATE public.teaching_sessions
    SET status = 'submitted',
        submitted_at = now(),
        updated_at = now()
    WHERE id = v_session.id
    RETURNING * INTO v_session;

    RETURN v_session;
END;
$$;
