import { requireGuruPage } from "@/lib/auth";
import { Wallet, Banknote, Calendar, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Honor Saya | Guru Uzma Course",
};

export default async function HonorGuruPage() {
  const { profile } = await requireGuruPage();

  const currentMonth = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const minimumIncome = profile?.minimum_income || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allowances = (profile?.allowances as any[]) || [];

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Page Title */}
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Rekap Honor</h1>
          <p className="text-xs text-slate-500">Estimasi pendapatan & rincian tunjangan</p>
        </div>
      </div>

      {/* Main Income Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between text-emerald-100 text-xs font-medium mb-1">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Periode {currentMonth}</span>
          </div>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-xs">
            Berjalan
          </span>
        </div>

        <div className="mt-3">
          <p className="text-xs text-emerald-100">Honor Dasar / Minimum Terjamin</p>
          <p className="text-2xl font-extrabold font-heading mt-0.5">
            {minimumIncome > 0 ? `Rp ${minimumIncome.toLocaleString("id-ID")}` : "Rp 0"}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-emerald-50">
          <span>Rekening Pencairan</span>
          <span className="font-semibold text-white">
            {profile?.bank_name ? `${profile.bank_name} •••${profile.bank_account_number?.slice(-4) || ""}` : "Belum diatur"}
          </span>
        </div>
      </div>

      {/* Rincian Tunjangan Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Daftar Tunjangan Tetap</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {allowances.length} Komponen
          </span>
        </div>

        {allowances.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">
            Tidak ada komponen tunjangan tetap tambahan.
          </div>
        ) : (
          <div className="space-y-2">
            {allowances.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs"
              >
                <span className="font-medium text-slate-700">{item.name || "Tunjangan"}</span>
                <span className="font-bold text-slate-900">
                  Rp {Number(item.amount || 0).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sesi Mengajar Estimasi Info */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-amber-950">Informasi Perhitungan Honor Sesi</p>
          <p className="text-amber-800/90 mt-0.5">
            Akumulasi honor mengajar berbasis kehadiran per sesi (Phase 2b Payroll) akan dihitung otomatis saat rekap bulanan ditutup oleh Admin.
          </p>
        </div>
      </div>
    </div>
  );
}
