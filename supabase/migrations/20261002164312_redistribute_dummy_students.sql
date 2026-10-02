-- Re-distribute dummy students to random programs so they aren't all in 'Mapel'
DO $$
DECLARE
    dummy_rec RECORD;
    var_rec RECORD;
BEGIN
    -- Delete existing program assignments for dummy students
    DELETE FROM public.student_programs 
    WHERE student_id IN (SELECT id FROM public.students WHERE full_name LIKE 'Murid Dummy %');

    -- Re-assign each dummy student to a random program variant
    FOR dummy_rec IN SELECT id FROM public.students WHERE full_name LIKE 'Murid Dummy %' LOOP
        -- Select a random variant
        SELECT p.id as program_id, pv.id as variant_id 
        INTO var_rec
        FROM public.programs p
        JOIN public.program_variants pv ON pv.program_id = p.id
        ORDER BY random()
        LIMIT 1;

        IF var_rec.program_id IS NOT NULL THEN
            INSERT INTO public.student_programs (student_id, program_id, variant_id, spp_amount)
            VALUES (dummy_rec.id, var_rec.program_id, var_rec.variant_id, 150000);
        END IF;
    END LOOP;
END $$;
