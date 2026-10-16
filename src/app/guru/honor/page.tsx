import { requireGuruPage } from "@/lib/auth";
import {
  Wallet,
  Banknote,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  Clock,
} from "lucide-react";
import {
  getTeacherPayrollStatement,
  getOpenPayrollPeriod,
  calculatePayrollTotals,
  type ProfileAllowanceItem,
} from "@/lib/payroll";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Honor Saya | Guru Uzma Course",
};

interface HonorGuruPageProps {
  searchParams: Promise<{
    period?: string;
  }>;
}

function formatMonth(dateStr: string) {
  try {
    const d = new Date(`${dateStr}T00:00:00Z`);
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function getCurrentMonthFirstDay(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export default async function HonorGuruPage({
  searchParams,
}: HonorGuruPageProps) {
  const { profile } = await requireGuruPage();
  const { period: requestedPeriodId } = await searchParams;

  const currentMonthDate = getCurrentMonthFirstDay();
  const currentMonthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  let statement = requestedPeriodId
    ? await getTeacherPayrollStatement(profile.id, requestedPeriodId)
    : null;

  // Fallback: load recent closed/paid period statement or open period
  if (!statement) {
    const supabase = await createClient();
    const { data: recentEntry } = await supabase
      .from("payroll_entries")
      .select("period_id")
      .eq("teacher_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentEntry) {
      statement = await getTeacherPayrollStatement(
        profile.id,
        recentEntry.period_id
      );
    }
  }

  // If still no closed statement, calculate live open-period estimate
  let liveOpenTotals = null;
  if (!statement) {
    const openPeriod = await getOpenPayrollPeriod(currentMonthDate);
    const supabase = await createClient();

    const { data: submittedSessions } = await supabase
      .from("teaching_sessions")
      .select("id, teaching_session_students(attendance_status, teacher_fee_snapshot)")
      .eq("teacher_id", profile.id)
      .eq("status", "submitted")
      .gte("session_date", currentMonthDate);

    interface SubmittedStudentItem {
      attendance_status: string;
      teacher_fee_snapshot: number;
    }
    interface SubmittedSessionItem {
      id: string;
      teaching_session_students?: SubmittedStudentItem[];
    }

    const lines = (
      (submittedSessions || []) as unknown as SubmittedSessionItem[]
    ).flatMap((s) => {
      const students = s.teaching_session_students || [];
      return students.map((st) => ({
        attendance_status: st.attendance_status,
        payable_amount:
          st.attendance_status === "present" ? st.teacher_fee_snapshot : 0,
      }));
    });

    const allowances = Array.isArray(profile?.allowances)
      ? (profile.allowances as unknown as ProfileAllowanceItem[])
      : [];
    liveOpenTotals = calculatePayrollTotals(lines, allowances, []);

    if (openPeriod) {
      statement = {
        period: openPeriod,
        entry: null,
        lines: [],
        adjustments: [],
        totals: liveOpenTotals,
      };
    }
  }

  const periodStatus = statement?.period.status || "open";
  const totals = statement?.totals || liveOpenTotals || {
    fee_sessions_total: 0,
    fixed_allowances_total: 0,
    adjustments_total: 0,
    total_amount: 0,
  };

  const allowances: ProfileAllowanceItem[] = Array.isArray(
    statement?.entry?.allowances_snapshot
  )
    ? (statement.entry.allowances_snapshot as unknown as ProfileAllowanceItem[])
    : Array.isArray(profile?.allowances)
    ? (profile.allowances as unknown as ProfileAllowanceItem[])
    : [];

  const minimumIncome =
    statement?.entry?.minimum_income_snapshot ?? (profile?.minimum_income || 0);

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Page Title */}
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Rekap Honor</h1>
          <p className="text-xs text-slate-500">
            Pernyataan pendapatan & rincian tunjangan
          </p>
        </div>
      </div>

      {/* Main Income Statement Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between text-emerald-100 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Periode{" "}
              {statement?.period
                ? formatMonth(statement.period.period_month)
                : currentMonthLabel}
            </span>
          </div>

          {periodStatus === "paid" && (
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-xs inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-200" />
              Sudah Ditransfer / Paid
            </span>
          )}
          {periodStatus === "closed" && (
            <span className="bg-indigo-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-xs inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-indigo-200" />
              Periode Ditutup / Menunggu Transfer
            </span>
          )}
          {periodStatus === "open" && (
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-xs inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-200" />
              Estimasi Berjalan
            </span>
          )}
        </div>

        <div>
          <p className="text-xs text-emerald-100">Total Take-Home Pay</p>
          <p className="text-3xl font-black font-heading mt-0.5">
            Rp {totals.total_amount.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="pt-3 border-t border-white/15 grid grid-cols-2 gap-2 text-xs text-emerald-50">
          <div>
            <span className="block text-[11px] opacity-80">Total Fee Sesi</span>
            <span className="font-bold text-white">
              Rp {totals.fee_sessions_total.toLocaleString("id-ID")}
            </span>
          </div>
          <div>
            <span className="block text-[11px] opacity-80">Tunjangan Tetap</span>
            <span className="font-bold text-white">
              Rp {totals.fixed_allowances_total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-emerald-50">
          <span>Rekening Pencairan</span>
          <span className="font-semibold text-white">
            {profile?.bank_name
              ? `${profile.bank_name} •••${profile.bank_account_number?.slice(-4) || ""}`
              : "Belum diatur"}
          </span>
        </div>
      </div>

      {/* Rincian Tunjangan Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Komponen Tunjangan Tetap</span>
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
                <span className="font-medium text-slate-700">
                  {item.name || "Tunjangan"}
                </span>
                <span className="font-bold text-slate-900">
                  Rp {Number(item.amount || 0).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        )}

        {minimumIncome > 0 && (
          <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <span>Garansi Minimum Terdaftar</span>
            <span className="font-semibold">
              Rp {minimumIncome.toLocaleString("id-ID")}
            </span>
          </div>
        )}
      </div>

      {/* Adjustments Section (If any) */}
      {statement?.adjustments && statement.adjustments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">
              Penyesuaian (Adjustment)
            </h3>
            <span
              className={`text-xs font-bold ${
                totals.adjustments_total < 0
                  ? "text-rose-600"
                  : "text-emerald-600"
              }`}
            >
              Rp {totals.adjustments_total.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            {statement.adjustments.map((adj) => (
              <div
                key={adj.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl"
              >
                <span className="text-slate-700">{adj.reason}</span>
                <span
                  className={`font-bold ${
                    adj.amount < 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {adj.amount > 0 ? "+" : ""}Rp{" "}
                  {adj.amount.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informational Footer */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-amber-950">Aturan Perhitungan</p>
          <p className="text-amber-800/90 mt-0.5">
            Fee sesi dihitung otomatis dari kartu mengajar yang telah berstatus
            Submitted. Rekap final terkunci permanen saat periode ditutup dan
            dibayar oleh Admin.
          </p>
        </div>
      </div>
    </div>
  );
}
