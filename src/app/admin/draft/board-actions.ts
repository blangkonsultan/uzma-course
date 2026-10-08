"use server";

import { requireAdminAction } from "@/lib/auth";
import { 
  insertScheduleClass, 
  insertSchedulePlacement, 
  deleteScheduleClass, 
  deleteSchedulePlacement 
} from "@/lib/board";

export async function createScheduleClass(data: {
  draft_id: string;
  shift_id: string;
  day_of_week: number;
  teacher_id: string;
  variant_id: string;
  start_time: string;
  end_time: string;
}) {
  await requireAdminAction();
  
  try {
    const result = await insertScheduleClass(data);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Pass through validation messages which might just be string
      if (error.message.includes("Gagal membuat wadah kelas")) {
        throw error; 
      }
      if (error.message.includes("keluar dari batas shift") || 
          error.message.includes("bertabrakan") ||
          error.message.includes("tidak ditemukan")) {
        throw error;
      }
      throw new Error(`Gagal membuat wadah kelas: ${error.message}`);
    }
    throw new Error("Gagal membuat wadah kelas.");
  }
}

export async function createSchedulePlacement(data: {
  class_id: string;
  student_id: string;
}) {
  await requireAdminAction();

  try {
    const result = await insertSchedulePlacement(data);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("Gagal memindahkan murid") || 
          error.message.includes("Kuota kelas sudah penuh") ||
          error.message.includes("tidak ditemukan")) {
        throw error;
      }
      throw new Error(`Gagal memindahkan murid: ${error.message}`);
    }
    throw new Error("Gagal memindahkan murid.");
  }
}

export async function removeScheduleClass(classId: string) {
  await requireAdminAction();
  try {
    await deleteScheduleClass(classId);
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function removeSchedulePlacement(placementId: string) {
  await requireAdminAction();
  try {
    await deleteSchedulePlacement(placementId);
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}
