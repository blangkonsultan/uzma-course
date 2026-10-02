-- Migrate schedule_classes to support precise time containers
-- 1. Drop existing dummy classes to cleanly apply NOT NULL constraint
TRUNCATE TABLE public.schedule_placements, public.schedule_classes CASCADE;

-- 2. Drop the overly strict unique constraint
ALTER TABLE public.schedule_classes DROP CONSTRAINT IF EXISTS uq_teacher_shift_day;

-- 3. Add explicit time columns
ALTER TABLE public.schedule_classes 
ADD COLUMN start_time TIME NOT NULL,
ADD COLUMN end_time TIME NOT NULL;
