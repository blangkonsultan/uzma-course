# Design Specification: Dynamic Kanban Scheduling

## 1. Overview & Goals
Uzma Course requires a highly flexible, drag-and-drop scheduling system for students and teachers. The system must support arbitrary changes, future planning ("Drafting" with date triggers), and strict capacity validation based on program variants.

## 2. Core Architecture: Versioned Scheduling
To solve the "turning point" problem (changing schedules without breaking historical attendance data), the system uses **Schedule Drafts**.
- A Schedule is created as a "Draft" (e.g., "Jadwal Ganjil 2026", "Jadwal Ramadhan").
- A Draft can be assigned an `effective_date`.
- When the date is reached, the draft automatically becomes the active schedule. Past attendance logs remain structurally valid because they were recorded under a historical state.

## 3. UI/UX Flow: Two-Tier Drag & Drop Board
The UI is an interactive Kanban-style board representing a specific Day (e.g., Monday). The board starts completely empty.

### Step 1: Creating the Container (Class Block)
- The columns represent Master Shifts (e.g., Pagi 09:00 - 12:30, Sore 15:00 - 19:30).
- The Admin sees a sidebar with available Teachers and the Program Variants they are qualified to teach.
- **Action:** Admin drags "Teacher Budi + BEE Variant" and drops it into the "Sore" column.
- **Result:** A new Class Container is created on the board, showing `[Budi - BEE] (0/5)`. The `5` is dynamically pulled from the `program_variants.system` capacity limit.

### Step 2: Assigning Students
- The Admin switches the sidebar to view "Unscheduled Students".
- **Action:** Admin drags "Student A" and drops them inside the `[Budi - BEE]` container.
- **Result:** Student A is now scheduled.
- **Validation:** 
  1. The student can only be dropped if they are enrolled in the BEE variant.
  2. The system rejects the drop if the container is already full (e.g., reached 5/5).

## 4. Database Schema Design

The system requires the following new structural relationships:

### A. `branch_shifts` (Master Time Slots)
- `id` (UUID)
- `branch_id` (TEXT)
- `name` (TEXT) - e.g., "Pagi", "Sore"
- `start_time` (TIME)
- `end_time` (TIME)

### B. `schedule_drafts` (The Version)
- `id` (UUID)
- `branch_id` (TEXT)
- `name` (TEXT)
- `effective_date` (DATE) - The trigger date.
- `status` (TEXT) - `draft`, `active`, `archived`

### C. `schedule_classes` (The Container)
- `id` (UUID)
- `draft_id` (UUID) - Belongs to a specific schedule version.
- `shift_id` (UUID) - Placed in a specific shift column.
- `day_of_week` (INTEGER) - 1 to 7 (Monday-Sunday).
- `teacher_id` (UUID) - Which teacher.
- `variant_id` (UUID) - Which program variant (dictates capacity).

### D. `schedule_placements` (The Students)
- `id` (UUID)
- `class_id` (UUID) - Links to the container above.
- `student_id` (UUID) - The scheduled student.

## 5. Security & Invariants
- **Constraint:** A student cannot be placed in two overlapping classes.
- **Constraint:** A class placement count cannot exceed its variant's `system` capacity constraint.
- **RLS:** Only Admins can modify schedule drafts, classes, and placements.
