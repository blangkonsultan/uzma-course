import { requireGuruPage } from "@/lib/auth";
import { getBranchById } from "@/lib/branches";
import { getTodayAttendance } from "@/lib/attendances";
import { AttendanceClient } from "@/components/guru/attendance-client";
import { MapPin } from "lucide-react";

export const metadata = {
  title: "Absensi Guru | Uzma Course",
};

export default async function AbsenPage() {
  const { profile } = await requireGuruPage();

  if (!profile.branch_id) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-orange-100 text-orange-600 p-4 rounded-full mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Cabang Belum Diatur</h2>
        <p className="text-slate-500 text-sm mt-2">
          Anda belum ditempatkan di cabang mana pun. Silakan hubungi Admin.
        </p>
      </div>
    );
  }

  const branch = await getBranchById(profile.branch_id);
  if (!branch) {
    return (
      <div className="p-4 text-center mt-10">Cabang tidak ditemukan di database.</div>
    );
  }

  const todayStatus = await getTodayAttendance(profile.id);

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-slate-800">Absensi Hari Ini</h1>
        <p className="text-slate-500 text-sm">Validasi lokasi & geofencing aktif</p>
      </div>

      <AttendanceClient 
        teacherId={profile.id}
        branchId={branch.id}
        branchName={branch.name}
        branchLat={branch.latitude}
        branchLng={branch.longitude}
        radiusMeters={branch.geofence_radius_m || 50}
        initialAttendanceId={todayStatus?.id || null}
        initialIsCheckedIn={!!todayStatus}
        initialIsCheckedOut={!!(todayStatus?.check_out_time)}
      />
    </div>
  );
}
