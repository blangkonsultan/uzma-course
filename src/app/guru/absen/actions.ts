"use server";

import { requireGuruAction } from "@/lib/auth";
import { insertCheckIn, updateCheckOut } from "@/lib/attendances";
import { createClient } from "@/lib/supabase/server";
import { calculateDistanceMeters } from "@/lib/pwa/haversine";
import type { PendingAttendance } from "@/lib/pwa/db";

export async function syncOfflineAttendances(records: PendingAttendance[]) {
  const { profile } = await requireGuruAction();

  const results = {
    success: [] as string[],
    failed: [] as string[],
  };

  // We should process them chronologically
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const record of sortedRecords) {
    // Account isolation: skip records that do not belong to the current authenticated teacher
    if (record.teacher_id !== profile.id) {
      continue;
    }

    try {
      if (record.type === "check_in") {
        await insertCheckIn({
          id: record.id,
          teacher_id: record.teacher_id,
          branch_id: record.branch_id,
          shift_id: record.shift_id,
          check_in_time: record.timestamp,
          check_in_lat: record.lat,
          check_in_lng: record.lng,
        });
        results.success.push(record.id);
      } else if (record.type === "check_out") {
        const targetAttendanceId = record.attendance_id || record.id;
        await updateCheckOut(targetAttendanceId, {
          check_out_time: record.timestamp,
          check_out_lat: record.lat,
          check_out_lng: record.lng,
        });
        results.success.push(record.id);
      }
    } catch {
      results.failed.push(record.id);
    }
  }

  return results;
}

export async function processOnlineCheckIn(
  sessionIdOrBranchId: string,
  branchIdOrLat: string | number,
  shiftIdOrLng?: string | number | null,
  latOrTimestamp?: number | string,
  lng?: number,
  timestamp?: string
) {
  const { profile } = await requireGuruAction();

  let sessionId: string;
  let branchId: string;
  let shiftId: string | null = null;
  let latitude: number;
  let longitude: number;
  let timeStr: string;

  if (
    typeof branchIdOrLat === "string" &&
    typeof lng === "number" &&
    typeof timestamp === "string"
  ) {
    // 6-argument signature: (sessionId, branchId, shiftId, lat, lng, timestamp)
    sessionId = sessionIdOrBranchId;
    branchId = branchIdOrLat;
    shiftId = (shiftIdOrLng as string | null) || null;
    latitude = latOrTimestamp as number;
    longitude = lng;
    timeStr = timestamp;
  } else {
    // 4-argument signature: (branchId, lat, lng, timestamp)
    sessionId = crypto.randomUUID();
    branchId = sessionIdOrBranchId;
    latitude = branchIdOrLat as number;
    longitude = shiftIdOrLng as number;
    timeStr = latOrTimestamp as string;
  }

  // 1. Fetch branch and validate geofence radius
  const supabase = await createClient();
  const { data: branch, error: branchErr } = await supabase
    .from("branches")
    .select("latitude, longitude, radius_meters, is_active")
    .eq("id", branchId)
    .single();

  if (branchErr || !branch || !branch.is_active) {
    return { success: false, error: "Cabang tidak valid atau tidak aktif." };
  }

  if (typeof branch.latitude === "number" && typeof branch.longitude === "number") {
    const distanceMeters = calculateDistanceMeters(
      latitude,
      longitude,
      branch.latitude,
      branch.longitude
    );
    const maxRadius = branch.radius_meters || 100;
    if (distanceMeters > maxRadius) {
      return {
        success: false,
        error: `Posisi Anda (${Math.round(distanceMeters)}m) berada di luar radius cabang (${maxRadius}m).`,
      };
    }
  }

  try {
    const record = await insertCheckIn({
      id: sessionId,
      teacher_id: profile.id,
      branch_id: branchId,
      shift_id: shiftId,
      check_in_time: timeStr,
      check_in_lat: latitude,
      check_in_lng: longitude,
    });
    return { success: true, data: record };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mencatat presensi masuk.",
    };
  }
}

export async function processOnlineCheckOut(
  attendanceId: string,
  lat: number,
  lng: number,
  timestamp: string
) {
  await requireGuruAction();

  try {
    const record = await updateCheckOut(attendanceId, {
      check_out_time: timestamp,
      check_out_lat: lat,
      check_out_lng: lng,
    });
    return { success: true, data: record };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mencatat presensi pulang.",
    };
  }
}
