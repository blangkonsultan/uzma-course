import { requireGuruPage } from "@/lib/auth";
import { Clock, Calendar, CheckCircle2, MapPin } from "lucide-react";

export default async function GuruDashboard() {
  const { profile } = await requireGuruPage();

  const formattedDate = new Intl.DateTimeFormat("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold text-slate-800">
          Halo, {profile?.full_name || "Guru"}!
        </h1>
        <p className="text-slate-500 text-sm">{formattedDate}</p>
      </div>

      {/* Quick Status Card */}
      <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 opacity-80" />
            <span className="font-medium opacity-90">Status Hari Ini</span>
          </div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            Belum Absen
          </span>
        </div>
        
        <div className="text-sm opacity-90 leading-relaxed">
          Jangan lupa untuk melakukan absensi kehadiran di lokasi sekolah sebelum jam mengajar dimulai.
        </div>
      </div>

      {/* Stats / Menu Placeholder */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
          <div className="bg-green-100 p-3 rounded-full text-green-600 mb-1">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-700">0</span>
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
          {/* Placeholder items */}
          <div className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mr-3 mt-1">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-700">Belum ada aktivitas</p>
              <p className="text-xs text-slate-500 mt-1">Riwayat absen akan muncul di sini</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
