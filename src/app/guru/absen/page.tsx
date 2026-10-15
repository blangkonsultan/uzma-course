import { requireGuruPage } from "@/lib/auth";
import { getTeacherAssignedBranches, getBranchShiftsMap } from "@/lib/teacher-branches";
import { getTodayAttendance, getWIBDateBounds } from "@/lib/attendances";
import { AttendanceClient } from "@/components/guru/attendance-client";
import { MapPin, Navigation, CalendarOff } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

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

  // 2. Cek apakah guru memiliki jadwal mengajar HARI INI (WIB)
  const adminSupabase = createAdminClient();
  const { dayOfWeek } = getWIBDateBounds();

  const { data: todayClasses, error: scheduleError } = await adminSupabase
    .from("schedule_classes")
    .select("id, shift_id, start_time, end_time, schedule_drafts!inner(branch_id, status)")
    .eq("teacher_id", profile.id)
    .eq("day_of_week", dayOfWeek)
    .eq("schedule_drafts.status", "active");

  if (scheduleError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center max-w-sm mx-auto space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-2 border border-rose-200">
          <CalendarOff className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Gagal Memuat Jadwal</h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Terjadi kendala saat memeriksa jadwal mengajar Anda. Silakan muat ulang halaman.
          </p>
        </div>
      </div>
    );
  }

  const hasScheduleToday = todayClasses && todayClasses.length > 0;
  if (!hasScheduleToday) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center max-w-sm mx-auto space-y-4">
        <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center shadow-sm border border-slate-200">
          <CalendarOff className="w-10 h-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Hari Ini Libur</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Anda tidak memiliki jadwal mengajar di cabang manapun untuk hari ini. Waktunya beristirahat!
          </p>
        </div>
      </div>
    );
  }

  // Filter assignedBranches hanya ke cabang tempat guru mengajar hari ini
  const branchIdsWithClassesToday = new Set(todayClasses.map(c => c.schedule_drafts.branch_id));
  const activeAssignedBranches = assignedBranches.filter(b => branchIdsWithClassesToday.has(b.id));

  if (activeAssignedBranches.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] text-center max-w-sm mx-auto space-y-4">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-2 border border-amber-200">
          <MapPin className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Cabang Penugasan Berbeda</h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Anda memiliki jadwal mengajar hari ini, namun cabang tempat kelas diselenggarakan belum terhubung dengan penugasan resmi akun Anda. Silakan hubungi admin.
          </p>
        </div>
      </div>
    );
  }
  // 3. Ambil map shift aktif untuk cabang-cabang yang memiliki jadwal hari ini
  const branchIds = activeAssignedBranches.map((b) => b.id);
  const shiftsMap = await getBranchShiftsMap(branchIds);

  // Kumpulkan bounds aktual dari jadwal guru per shift (bukan waktu penuh shift)
  const shiftBounds: Record<string, { start_time: string; end_time: string }> = {};
  todayClasses.forEach((c) => {
    if (!shiftBounds[c.shift_id]) {
      shiftBounds[c.shift_id] = { start_time: c.start_time, end_time: c.end_time };
    } else {
      if (c.start_time < shiftBounds[c.shift_id].start_time) {
        shiftBounds[c.shift_id].start_time = c.start_time;
      }
      if (c.end_time > shiftBounds[c.shift_id].end_time) {
        shiftBounds[c.shift_id].end_time = c.end_time;
      }
    }
  });

  // Filter shift di shiftsMap hanya yang ada di jadwal guru hari ini
  // dan ganti start_time / end_time-nya dengan waktu aktual yang dimiliki guru
  const shiftIdsWithClassesToday = new Set(todayClasses.map(c => c.shift_id));
  const filteredShiftsMap: Record<string, typeof shiftsMap[string]> = {};
  for (const bId of branchIds) {
    if (shiftsMap[bId]) {
      filteredShiftsMap[bId] = shiftsMap[bId]
        .filter((s) => shiftIdsWithClassesToday.has(s.id))
        .map((s) => ({
          ...s,
          start_time: shiftBounds[s.id].start_time,
          end_time: shiftBounds[s.id].end_time,
        }))
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
  }

  // 4. Status presensi hari ini
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
        assignedBranches={activeAssignedBranches}
        shiftsMap={filteredShiftsMap}
        initialAttendanceId={todayStatus?.id || null}
        initialIsCheckedIn={!!todayStatus}
        initialIsCheckedOut={!!(todayStatus?.check_out_time)}
      />
    </div>
  );
}
