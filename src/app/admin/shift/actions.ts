"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/auth";
import {
  insertBranchShift,
  parseShiftTimeToSeconds,
  updateBranchShift,
  toggleBranchShiftActive,
} from "@/lib/shifts";

export interface ShiftActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function validateShiftTimes(
  startTime: string,
  endTime: string,
  fieldErrors: Record<string, string>
) {
  const startSec = startTime ? parseShiftTimeToSeconds(startTime) : null;
  const endSec = endTime ? parseShiftTimeToSeconds(endTime) : null;

  if (!startTime) {
    fieldErrors.start_time = "Jam mulai wajib diisi.";
  } else if (startSec === null) {
    fieldErrors.start_time = "Format jam mulai tidak valid (HH:MM).";
  }

  if (!endTime) {
    fieldErrors.end_time = "Jam selesai wajib diisi.";
  } else if (endSec === null) {
    fieldErrors.end_time = "Format jam selesai tidak valid (HH:MM).";
  }

  if (startSec !== null && endSec !== null && startSec >= endSec) {
    fieldErrors.end_time = "Jam selesai harus lebih akhir dari jam mulai.";
  }
}

export async function createShift(formData: FormData): Promise<ShiftActionResponse | void> {
  await requireAdminAction();

  const branchId = formData.get("branch_id")?.toString().trim() || "";
  const name = formData.get("name")?.toString().trim() || "";
  const startTime = formData.get("start_time")?.toString().trim() || "";
  const endTime = formData.get("end_time")?.toString().trim() || "";

  const fieldErrors: Record<string, string> = {};

  if (!branchId) fieldErrors.branch_id = "Cabang wajib dipilih.";
  if (!name) fieldErrors.name = "Nama shift wajib diisi.";
  validateShiftTimes(startTime, endTime, fieldErrors);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    await insertBranchShift({
      branch_id: branchId,
      name,
      start_time: startTime,
      end_time: endTime,
      is_active: true,
    });
  } catch (error: unknown) {
    return { error: `Gagal menyimpan shift: ${error instanceof Error ? error.message : "Unknown error"}` };
  }

  revalidatePath("/admin/shift");
  redirect("/admin/shift?success=" + encodeURIComponent("Shift berhasil ditambahkan"));
}

export async function updateShift(id: string, formData: FormData): Promise<ShiftActionResponse | void> {
  await requireAdminAction();

  const name = formData.get("name")?.toString().trim() || "";
  const startTime = formData.get("start_time")?.toString().trim() || "";
  const endTime = formData.get("end_time")?.toString().trim() || "";

  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = "Nama shift wajib diisi.";
  validateShiftTimes(startTime, endTime, fieldErrors);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    await updateBranchShift(id, {
      name,
      start_time: startTime,
      end_time: endTime,
      updated_at: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg.includes("Ada kelas di luar rentang jam baru")) {
      return {
        error: msg,
        fieldErrors: {
          start_time: "Ada kelas yang berada di luar rentang jam baru.",
          end_time: "Ada kelas yang berada di luar rentang jam baru.",
        },
      };
    }
    return { error: `Gagal memperbarui shift: ${msg}` };
  }

  revalidatePath("/admin/shift");
  revalidatePath(`/admin/shift/${id}/edit`);
  redirect("/admin/shift?success=" + encodeURIComponent("Shift berhasil diperbarui"));
}

export async function toggleShiftActive(id: string, currentStatus: boolean) {
  await requireAdminAction();

  try {
    await toggleBranchShiftActive(id, currentStatus);
  } catch (error: unknown) {
    throw new Error(`Gagal mengubah status: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  revalidatePath("/admin/shift");
}
