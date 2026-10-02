"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Hanya admin yang memiliki izin untuk operasi ini.");
  }

  return { user, supabase };
}

export async function createScheduleClass(data: {
  draft_id: string;
  shift_id: string;
  day_of_week: number;
  teacher_id: string;
  variant_id: string;
  start_time: string;
  end_time: string;
}) {
  const { supabase } = await requireAdmin();
  
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
    throw new Error(`Gagal membuat wadah kelas: ${error.message}`);
  }

  return result;
}

export async function createSchedulePlacement(data: {
  class_id: string;
  student_id: string;
}) {
  const { supabase } = await requireAdmin();
  
  const { data: result, error } = await supabase
    .from("schedule_placements")
    .insert({
      class_id: data.class_id,
      student_id: data.student_id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memindahkan murid: ${error.message}`);
  }

  return result;
}

export async function removeScheduleClass(classId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("schedule_classes").delete().eq("id", classId);
  if (error) throw new Error(error.message);
}

export async function removeSchedulePlacement(placementId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("schedule_placements").delete().eq("id", placementId);
  if (error) throw new Error(error.message);
}
