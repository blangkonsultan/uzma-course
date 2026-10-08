"use server";

import { requireGuruAction } from "@/lib/auth";
import { insertCheckIn, updateCheckOut, getTodayAttendance } from "@/lib/attendances";
import type { PendingAttendance } from "@/lib/pwa/db";

export async function syncOfflineAttendances(records: PendingAttendance[]) {
  await requireGuruAction();
  
  const results = {
    success: [] as string[],
    failed: [] as string[]
  };

  // We should process them chronologically
  const sortedRecords = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  for (const record of sortedRecords) {
    try {
      if (record.type === "check_in") {
        await insertCheckIn({
          teacher_id: record.teacher_id,
          branch_id: record.branch_id,
          check_in_time: record.timestamp,
          check_in_lat: record.lat,
          check_in_lng: record.lng,
        });
      } else if (record.type === "check_out") {
        // Need to find today's attendance to checkout
        const todayRecord = await getTodayAttendance(record.teacher_id);
        if (todayRecord && todayRecord.id) {
          await updateCheckOut(todayRecord.id, {
            check_out_time: record.timestamp,
            check_out_lat: record.lat,
            check_out_lng: record.lng,
          });
        } else {
          // If checkout without checkin, we might log it as error or create a check-out only record if schema permits.
          // For now, we skip and mark failed if no active check-in.
          throw new Error("No active check-in found for checkout");
        }
      }
      results.success.push(record.id);
    } catch {
      results.failed.push(record.id);
    }
  }

  return results;
}

export async function processOnlineCheckIn(branchId: string, lat: number, lng: number, timestamp: string) {
  const { profile } = await requireGuruAction();
  
  try {
    const result = await insertCheckIn({
      teacher_id: profile.id,
      branch_id: branchId,
      check_in_time: timestamp,
      check_in_lat: lat,
      check_in_lng: lng,
    });
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}

export async function processOnlineCheckOut(attendanceId: string, lat: number, lng: number, timestamp: string) {
  await requireGuruAction();
  
  try {
    const result = await updateCheckOut(attendanceId, {
      check_out_time: timestamp,
      check_out_lat: lat,
      check_out_lng: lng,
    });
    return { success: true, data: result.data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan" };
  }
}
