export interface KanbanBoardProps {
  draft: { id: string; name: string; branch_id: string; status: string };
  shifts: Array<{ id: string; name: string; start_time: string; end_time: string }>;
  teachers: Array<{ id: string; full_name: string; profile_programs: Array<{ program_id: string }> }>;
  variants: Array<{ id: string; name: string; system: number; duration?: number; program_id: string; programs: { id: string; name: string; initials?: string } | null }>;
  students: Array<{ id: string; full_name: string; student_programs: Array<{ program_id: string; variant_id: string }> }>;
  initialClasses: Array<unknown>;
}
