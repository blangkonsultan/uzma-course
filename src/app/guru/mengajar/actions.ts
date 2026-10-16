"use server";

import { requireGuruAction } from "@/lib/auth";
import { getWIBDateBounds } from "@/lib/attendances";
import {
  getTeacherScheduleClassForLog,
  saveTeacherTeachingSession,
  submitTeacherTeachingSession,
  validateTeachingSessionInput,
  type SaveTeacherTeachingSessionInput,
  type TeachingSessionRow,
} from "@/lib/teaching-logs";

export async function saveTeachingSession(
  input: SaveTeacherTeachingSessionInput
): Promise<{ data?: TeachingSessionRow; error?: string }> {
  const { profile } = await requireGuruAction();
  const classData = await getTeacherScheduleClassForLog(
    profile.id,
    input.schedule_class_id
  );

  if (!classData) {
    return { error: "Kelas tidak ditemukan atau bukan jadwal guru ini." };
  }

  const validation = validateTeachingSessionInput(
    input,
    classData.day_of_week,
    getWIBDateBounds().dateString,
    "draft"
  );
  if (validation.error) return validation;

  try {
    const data = await saveTeacherTeachingSession(profile.id, input);
    return { data };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal menyimpan kartu mengajar.",
    };
  }
}

export async function submitTeachingSession(
  sessionId: string
): Promise<{ data?: TeachingSessionRow; error?: string }> {
  const { profile } = await requireGuruAction();

  try {
    const data = await submitTeacherTeachingSession(profile.id, sessionId);
    return { data };
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengirim kartu mengajar.",
    };
  }
}
