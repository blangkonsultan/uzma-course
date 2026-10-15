import { createClient } from "@/lib/supabase/server";

export interface AttendanceRecord {
  id?: string;
  teacher_id: string;
  branch_id: string;
  shift_id?: string | null;
  check_in_time: string;
  check_out_time?: string | null;
  check_in_lat: number;
  check_in_lng: number;
  check_out_lat?: number | null;
  check_out_lng?: number | null;
  notes?: string | null;
}

export function getWIBDateBounds(targetDate: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateString = formatter.format(targetDate);
  const startOfDay = new Date(`${dateString}T00:00:00+07:00`).toISOString();
  const endOfDay = new Date(`${dateString}T23:59:59.999+07:00`).toISOString();

  const nowWIB = new Date(targetDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const rawDay = nowWIB.getDay();
  const dayOfWeek = rawDay === 0 ? 7 : rawDay;

  return { dateString, startOfDay, endOfDay, dayOfWeek };
}

export async function getTodayAttendance(
  teacherId: string,
  branchId?: string | null,
  shiftId?: string | null
) {
  const supabase = await createClient();
  const { startOfDay, endOfDay } = getWIBDateBounds();

  let query = supabase
    .from("teacher_attendances")
    .select("*")
    .eq("teacher_id", teacherId)
    .gte("check_in_time", startOfDay)
    .lte("check_in_time", endOfDay);

  if (branchId) {
    query = query.eq("branch_id", branchId);
  }
  if (shiftId) {
    query = query.eq("shift_id", shiftId);
  }

  const { data, error } = await query
    .order("check_in_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal membaca presensi hari ini: ${error.message}`);
  }

  return data;
}

export async function insertCheckIn(data: AttendanceRecord) {
  const supabase = await createClient();
  const payload = {
    ...(data.id ? { id: data.id } : {}),
    teacher_id: data.teacher_id,
    branch_id: data.branch_id,
    shift_id: data.shift_id || null,
    check_in_time: data.check_in_time,
    check_in_lat: data.check_in_lat,
    check_in_lng: data.check_in_lng,
  };

  const { data: record, error } = await supabase
    .from("teacher_attendances")
    .upsert(payload, { onConflict: "id", ignoreDuplicates: true })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan presensi masuk: ${error.message}`);
  }

  return record;
}

export async function updateCheckOut(
  id: string,
  data: { check_out_time: string; check_out_lat: number; check_out_lng: number }
) {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("teacher_attendances")
    .update({
      check_out_time: data.check_out_time,
      check_out_lat: data.check_out_lat,
      check_out_lng: data.check_out_lng,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan presensi pulang: ${error.message}`);
  }

  return record;
}
