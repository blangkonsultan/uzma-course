-- Cookie-authenticated schedule/card joins must retain the actual program and
-- variant for an assigned class even after catalogue deactivation. Ownership is
-- independent of draft status and branch; no student or financial policy changes.
--
-- Dependency direction is acyclic: program_variants -> schedule_classes/profiles.
-- Existing class SELECT policies never query programs or variants. Parent
-- programs are already readable through the incumbent public SELECT policy;
-- preserve that existing nonfinancial permission without adding a new policy.
CREATE POLICY "Guru reads assigned program variants"
    ON public.program_variants FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'guru'
        )
        AND EXISTS (
            SELECT 1 FROM public.schedule_classes sc
            WHERE sc.teacher_id = auth.uid()
              AND sc.variant_id = public.program_variants.id
        )
    );
