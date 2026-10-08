import { createClient } from "@/lib/supabase/server";

export interface AttendanceRecord {
  id?: string;
  teacher_id: string;
  branch_id: string;
  check_in_time: string;
  check_out_time?: string | null;
  check_in_lat: number;
  check_in_lng: number;
  check_out_lat?: number | null;
  check_out_lng?: number | null;
  notes?: string | null;
}

export async function getTodayAttendance(teacherId: string) {
  const supabase = await createClient();
  
  // Get today's start and end in local time ideally, but UTC works for now
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = today.toISOString();
  
  today.setHours(23, 59, 59, 999);
  const endOfDay = today.toISOString();

  const { data } = await supabase
    .from("teacher_attendances")
    .select("*")
    .eq("teacher_id", teacherId)
    .gte("check_in_time", startOfDay)
    .lte("check_in_time", endOfDay)
    .order("check_in_time", { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function insertCheckIn(data: AttendanceRecord) {
  const supabase = await createClient();
  return supabase.from("teacher_attendances").insert({
    teacher_id: data.teacher_id,
    branch_id: data.branch_id,
    check_in_time: data.check_in_time,
    check_in_lat: data.check_in_lat,
    check_in_lng: data.check_in_lng,
  }).select().single();
}

export async function updateCheckOut(id: string, data: { check_out_time: string, check_out_lat: number, check_out_lng: number }) {
  const supabase = await createClient();
  return supabase.from("teacher_attendances").update({
    check_out_time: data.check_out_time,
    check_out_lat: data.check_out_lat,
    check_out_lng: data.check_out_lng,
  }).eq("id", id).select().single();
}
