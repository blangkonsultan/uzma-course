import { requireGuruPage } from "@/lib/auth";
import { Clock, Calendar, CheckCircle2, MapPin, CalendarDays, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { LiveClock } from "@/components/guru/live-clock";
import { getTodayAttendance } from "@/lib/attendances";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTimeString } from "@/lib/utils";

function formatWIB(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(".", ":") + " WIB";
}

export default async function GuruDashboard() {
  const { profile } = await requireGuruPage();

  const todayAttendance = await getTodayAttendance(profile.id);

  // Ambil rekap bulan ini & 3 aktivitas terakhir
  const adminSupabase = createAdminClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyData } = await adminSupabase
    .from("teacher_attendances")
    .select("id, check_in_time, branches(name)")
    .eq("teacher_id", profile.id)
    .gte("check_in_time", startOfMonth.toISOString())
    .order("check_in_time", { ascending: false });

  const hadirBulanIni = monthlyData?.length || 0;
  const recentActivities = monthlyData?.slice(0, 3) || [];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-slate-800">
          Halo, {profile?.full_name || "Guru"}!
        </h1>
        <LiveClock />
      </div>

      {/* Quick Status Card */}
      <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 opacity-80" />
            <span className="font-medium opacity-90">Status Hari Ini</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${todayAttendance ? 'bg-emerald-400/20 text-emerald-50' : 'bg-white/20'}`}>
            {todayAttendance ? 'Sudah Presensi' : 'Belum Presensi'}
          </span>
        </div>
        
        <div className="text-sm opacity-90 leading-relaxed">
          {todayAttendance 
            ? `Terima kasih! Anda telah check-in pada pukul ${formatWIB(todayAttendance.check_in_time)}.`
            : 'Jangan lupa untuk melakukan presensi kehadiran di lokasi sekolah sebelum jam mengajar dimulai.'}
        </div>
      </div>

      {/* Shortcut to Jadwal Saya */}
      <Link
        href="/guru/jadwal"
        className="flex items-center justify-between p-4 bg-indigo-50/70 border border-indigo-100/80 rounded-2xl hover:bg-indigo-100/60 transition-colors group"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Jadwal Mengajar Saya</h3>
            <p className="text-xs text-slate-500 mt-0.5">Lihat jadwal harian dan daftar murid binaan</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-indigo-600 transform group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Shortcut to Honor Saya */}
      <Link
        href="/guru/honor"
        className="flex items-center justify-between p-4 bg-emerald-50/70 border border-emerald-100/80 rounded-2xl hover:bg-emerald-100/60 transition-colors group"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Rekap Honor Saya</h3>
            <p className="text-xs text-slate-500 mt-0.5">Lihat rincian honor minimum dan tunjangan</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-emerald-600 transform group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Stats / Menu Placeholder */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
          <div className="bg-green-100 p-3 rounded-full text-green-600 mb-1">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-700">{hadirBulanIni}</span>
          <span className="text-xs text-slate-500 font-medium">Hadir Bulan Ini</span>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600 mb-1">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-700">0</span>
          <span className="text-xs text-slate-500 font-medium">Izin Bulan Ini</span>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="pt-2">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Aktivitas Terakhir</h2>
        
        <div className="flex flex-col space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((act) => {
              const d = new Date(act.check_in_time);
              const dateStr = d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short" });
              const timeStr = formatWIB(act.check_in_time);
              const branchName = act.branches?.name || "Cabang Utama";
              
              return (
                <div key={act.id} className="flex items-start p-3 bg-white shadow-xs rounded-xl border border-slate-100">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mr-3 mt-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">Check-in {branchName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{dateStr} • Pukul {timeStr}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3 mt-1 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-700">Belum ada aktivitas</p>
                <p className="text-xs text-slate-500 mt-1">Riwayat presensi akan muncul di sini</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
