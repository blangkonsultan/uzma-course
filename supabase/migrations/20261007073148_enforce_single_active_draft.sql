-- Function to ensure only one active draft exists per branch
CREATE OR REPLACE FUNCTION public.ensure_single_active_draft()
RETURNS TRIGGER AS $$
BEGIN
    -- If the current row is being set to 'active'
    IF NEW.status = 'active' THEN
        -- Archive all other active drafts for the SAME branch
        UPDATE public.schedule_drafts
        SET status = 'archived',
            updated_at = now()
        WHERE branch_id = NEW.branch_id
          AND id != NEW.id
          AND status = 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function before insert or update
DROP TRIGGER IF EXISTS tr_ensure_single_active_draft ON public.schedule_drafts;
CREATE TRIGGER tr_ensure_single_active_draft
    BEFORE INSERT OR UPDATE ON public.schedule_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_active_draft();
