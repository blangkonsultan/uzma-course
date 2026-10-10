-- Drop the unique constraint to allow multiple sessions per shift for the same teacher
ALTER TABLE public.schedule_classes DROP CONSTRAINT IF EXISTS uq_teacher_shift_day;
