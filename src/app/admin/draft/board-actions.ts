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
}) {
  const { supabase } = await requireAdmin();
  
  const { data: result, error } = await supabase
    .from("schedule_classes")
    .insert({
      draft_id: data.draft_id,
      shift_id: data.shift_id,
      day_of_week: data.day_of_week,
      teacher_id: data.teacher_id,
      variant_id: data.variant_id,
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
