import "server-only";
import type { GuideDefinition } from "@/types/guides";
import { createGuideIndex } from "./navigation";
import { GURU_GETTING_STARTED } from "./guru/getting-started";
import { GURU_SCHEDULE } from "./guru/schedule";
import { GURU_ATTENDANCE } from "./guru/attendance";
import { GURU_OFFLINE } from "./guru/offline";
import { GURU_TEACHING_CARDS } from "./guru/teaching-cards";
import { GURU_HONOR } from "./guru/honor";
import { GURU_PROFILE } from "./guru/profile";

export const GURU_GUIDE = {
  role: "guru",
  title: "Panduan Guru",
  description: "Langkah mengajar, presensi, kartu murid, dan akun pada portal guru.",
  defaultTopic: "mulai",
  chapters: [
    GURU_GETTING_STARTED,
    GURU_SCHEDULE,
    GURU_ATTENDANCE,
    GURU_OFFLINE,
    GURU_TEACHING_CARDS,
    GURU_HONOR,
    GURU_PROFILE,
  ],
} as const satisfies GuideDefinition;

export const GURU_GUIDE_INDEX = createGuideIndex(GURU_GUIDE);
