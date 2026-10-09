import { requireGuruPage } from "@/lib/auth";
import { getTeacherAssignedBranches, getBranchShiftsMap } from "@/lib/teacher-branches";
import { getTodayAttendance } from "@/lib/attendances";
import { AttendanceClient } from "@/components/guru/attendance-client";
import { MapPin, Navigation } from "lucide-react";

export const metadata = {
  title: "Presensi Kehadiran | Guru Uzma Course",
};

export default async function AbsenPage() {
  const { profile } = await requireGuruPage();

  // 1. Ambil seluruh cabang yang secara resmi ditugaskan ke guru ini
  const assignedBranches = await getTeacherAssignedBranches(profile.id);

  if (assignedBranches.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center max-w-sm mx-auto">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 border border-amber-200">
          <MapPin className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Cabang Penugasan Belum Diatur</h2>
        <p className="text-slate-500 text-xs mt-2 leading-relaxed">
          Akun Anda belum dialokasikan ke cabang bimbingan belajar manapun. Silakan hubungi admin operasional untuk mengatur cabang tugas Anda.
        </p>
      </div>
    );
  }

  // 2. Ambil map shift aktif untuk cabang-cabang yang ditugaskan
  const branchIds = assignedBranches.map((b) => b.id);
  const shiftsMap = await getBranchShiftsMap(branchIds);

  // 3. Status presensi hari ini
  const todayStatus = await getTodayAttendance(profile.id);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex items-center space-x-2.5">
        <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center shrink-0 border border-primary-200/60 shadow-2xs">
          <Navigation className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Presensi Kehadiran</h1>
          <p className="text-xs text-slate-500">Pilih cabang tugas & validasi radius GPS</p>
        </div>
      </div>

      <AttendanceClient
        teacherId={profile.id}
        assignedBranches={assignedBranches}
        shiftsMap={shiftsMap}
        initialAttendanceId={todayStatus?.id || null}
        initialIsCheckedIn={!!todayStatus}
        initialIsCheckedOut={!!(todayStatus?.check_out_time)}
      />
    </div>
  );
}
