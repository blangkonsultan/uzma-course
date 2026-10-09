import { requireGuruPage } from "@/lib/auth";
import { getTeacherActiveSchedule } from "@/lib/teacher-schedule";
import { TeacherScheduleClient } from "@/components/guru/teacher-schedule-client";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Jadwal Saya | Guru Uzma Course",
};

export default async function JadwalGuruPage() {
  const { profile } = await requireGuruPage();

  const { draft, classes } = await getTeacherActiveSchedule(
    profile.id,
    profile.branch_id
  );

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Jadwal Mengajar</h1>
          <p className="text-xs text-slate-500">
            Jadwal sesi kelas & daftar murid binaan
          </p>
        </div>
      </div>

      <TeacherScheduleClient
        classes={classes}
        draftName={draft?.name || null}
      />
    </div>
  );
}
