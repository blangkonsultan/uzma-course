import { createClient } from "./supabase/server";

export async function getBoardData(draftId: string) {
  const supabase = await createClient();

  // 1. Get draft
  const { data: draft, error: draftErr } = await supabase
    .from("schedule_drafts")
    .select("*")
    .eq("id", draftId)
    .single();

  if (draftErr || !draft) {
    throw new Error("Draft not found");
  }

  const branchId = draft.branch_id;

  // 2. Get shifts
  const { data: shifts } = await supabase
    .from("branch_shifts")
    .select("*")
    .eq("branch_id", branchId)
    .eq("is_active", true)
    .order("start_time");

  // 3. Get teachers (profiles)
  const { data: teachers } = await supabase
    .from("profiles")
    .select("*, profile_programs(program_id)")
    .eq("branch_id", branchId)
    .eq("role", "guru")
    .eq("is_active", true);

  // 4. Get program variants (for capacity and teacher assignment)
  const { data: variants } = await supabase
    .from("program_variants")
    .select("*, programs(*)")
    .eq("is_active", true);

  // 5. Get students and their enrollments
  const { data: students } = await supabase
    .from("students")
    .select("*, student_programs(program_id, variant_id)")
    .eq("branch_id", branchId)
    .eq("is_active", true);

  // 6. Get existing classes and placements for this draft
  const { data: classes } = await supabase
    .from("schedule_classes")
    .select("*, schedule_placements(*)")
    .eq("draft_id", draftId);

  return {
    draft,
    shifts: shifts || [],
    teachers: teachers || [],
    variants: variants || [],
    students: students || [],
    classes: classes || [],
  };
}

export async function insertScheduleClass(data: {
  draft_id: string;
  shift_id: string;
  day_of_week: number;
  teacher_id: string;
  variant_id: string;
  start_time: string;
  end_time: string;
}) {
  const supabase = await createClient();
  
  // 1. Validate Shift Bounds
  const { data: shift, error: shiftErr } = await supabase
    .from("branch_shifts")
    .select("start_time, end_time")
    .eq("id", data.shift_id)
    .single();

  if (shiftErr || !shift) throw new Error("Shift tidak ditemukan.");
  if (data.start_time < shift.start_time || data.end_time > shift.end_time) {
    throw new Error(`Waktu sesi (${data.start_time.slice(0, 5)}-${data.end_time.slice(0, 5)}) keluar dari batas shift (${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)}).`);
  }

  // 2. Validate Teacher Overlap
  const { data: overlaps, error: overlapErr } = await supabase
    .from("schedule_classes")
    .select("id")
    .eq("draft_id", data.draft_id)
    .eq("day_of_week", data.day_of_week)
    .eq("teacher_id", data.teacher_id)
    .or(`and(start_time.lt.${data.end_time},end_time.gt.${data.start_time})`);

  if (overlapErr) throw new Error("Gagal memvalidasi jadwal.");
  if (overlaps && overlaps.length > 0) {
    throw new Error("Jadwal bertabrakan dengan sesi guru yang lain di hari yang sama.");
  }

  const { data: result, error } = await supabase
    .from("schedule_classes")
    .insert({
      draft_id: data.draft_id,
      shift_id: data.shift_id,
      day_of_week: data.day_of_week,
      teacher_id: data.teacher_id,
      variant_id: data.variant_id,
      start_time: data.start_time,
      end_time: data.end_time,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

export async function insertSchedulePlacement(data: {
  class_id: string;
  student_id: string;
}) {
  const supabase = await createClient();

  // Validate capacity
  const { data: classData, error: classErr } = await supabase
    .from("schedule_classes")
    .select(`
      id,
      program_variants ( system ),
      schedule_placements ( id )
    `)
    .eq("id", data.class_id)
    .single();

  if (classErr || !classData) throw new Error("Wadah kelas tidak ditemukan.");
  
  const variant = classData.program_variants as unknown as { system: number } | null | undefined;
  const capacity = variant?.system || 1;
  const placements = classData.schedule_placements as unknown as { id: string }[] | null | undefined;
  const currentCount = Array.isArray(placements) ? placements.length : 0;

  if (currentCount >= capacity) {
    throw new Error(`Gagal: Kuota kelas sudah penuh (Maksimal ${capacity} murid).`);
  }

  const { data: result, error } = await supabase
    .from("schedule_placements")
    .insert({
      class_id: data.class_id,
      student_id: data.student_id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

export async function deleteScheduleClass(classId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_classes").delete().eq("id", classId);
  if (error) throw new Error(error.message);
}

export async function deleteSchedulePlacement(placementId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_placements").delete().eq("id", placementId);
  if (error) throw new Error(error.message);
}
