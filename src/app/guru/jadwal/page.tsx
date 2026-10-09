import { requireGuruPage } from "@/lib/auth";
import { getTeacherActiveSchedule } from "@/lib/teacher-schedule";
import { TeacherScheduleClient } from "@/components/guru/teacher-schedule-client";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Jadwal Saya | Guru Uzma Course",
};

export default async function JadwalGuruPage() {
  const { profile } = await requireGuruPage();
  const { classes } = await getTeacherActiveSchedule(profile.id);

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-primary-100 text-primary-700 rounded-xl border border-primary-200/60 shadow-2xs">
          <Calendar className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Jadwal Mengajar</h1>
          <p className="text-xs text-slate-500">
            Seluruh jadwal tugas lintas cabang
          </p>
        </div>
      </div>

      <TeacherScheduleClient classes={classes} />
    </div>
  );
}
