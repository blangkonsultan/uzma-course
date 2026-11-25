import { createClient } from "./supabase/server";

export interface BranchShift {
  id: string;
  branch_id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getBranchShifts(branchId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("branch_shifts")
    .select("*")
    .order("start_time", { ascending: true });

  if (branchId) {
    query = query.eq("branch_id", branchId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching branch shifts:", error);
    return [];
  }
  return data as BranchShift[];
}

export async function getBranchShiftById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branch_shifts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as BranchShift;
}

const SHIFT_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export function parseShiftTimeToSeconds(timeStr: string): number | null {
  if (!SHIFT_TIME_PATTERN.test(timeStr)) return null;
  const [h, m, s = 0] = timeStr.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export async function insertBranchShift(data: {
  branch_id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}) {
  const startSec = parseShiftTimeToSeconds(data.start_time);
  const endSec = parseShiftTimeToSeconds(data.end_time);
  if (startSec === null || endSec === null) {
    throw new Error("Format jam shift tidak valid.");
  }
  if (startSec >= endSec) {
    throw new Error("Jam selesai harus lebih akhir dari jam mulai.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("branch_shifts").insert(data);
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateBranchShift(
  id: string,
  data: {
    name?: string;
    start_time?: string;
    end_time?: string;
    updated_at?: string;
  }
) {
  const supabase = await createClient();

  if (data.start_time !== undefined || data.end_time !== undefined) {
    // If either start_time or end_time is not provided, load the current record to check bounds safely
    let targetStart = data.start_time;
    let targetEnd = data.end_time;

    if (targetStart === undefined || targetEnd === undefined) {
      const current = await getBranchShiftById(id);
      if (!current) {
        throw new Error("Shift tidak ditemukan.");
      }
      targetStart = targetStart ?? current.start_time;
      targetEnd = targetEnd ?? current.end_time;
    }

    // Validate strict time format and positive interval ordering before building PostgREST filters
    const startSec = parseShiftTimeToSeconds(targetStart);
    const endSec = parseShiftTimeToSeconds(targetEnd);
    if (startSec === null || endSec === null) {
      throw new Error("Format jam shift tidak valid.");
    }
    if (startSec >= endSec) {
      throw new Error("Jam selesai harus lebih akhir dari jam mulai.");
    }
    const { data: strandedClasses, error: lookupError } = await supabase
      .from("schedule_classes")
      .select("id, start_time, end_time")
      .eq("shift_id", id)
      .or(`start_time.lt.${targetStart},end_time.gt.${targetEnd}`);

    if (lookupError) {
      throw new Error(`Gagal memeriksa jadwal kelas shift: ${lookupError.message}`);
    }

    if (strandedClasses && strandedClasses.length > 0) {
      throw new Error(
        "Ada kelas di luar rentang jam baru. Sesuaikan jadwal kelas terlebih dahulu, lalu simpan ulang."
      );
    }
  }
  const { error } = await supabase
    .from("branch_shifts")
    .update(data)
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleBranchShiftActive(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("branch_shifts")
    .update({ 
        is_active: !currentStatus,
        updated_at: new Date().toISOString()
    })
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
