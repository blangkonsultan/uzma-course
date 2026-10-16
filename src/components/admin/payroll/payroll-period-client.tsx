"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Plus,
} from "lucide-react";
import {
  closePeriodAction,
  markPeriodPaidAction,
  addAdjustmentAction,
  createPeriodAction,
} from "@/app/admin/payroll/actions";
import { PayrollAdjustmentForm } from "./payroll-adjustment-form";
import type { AdminPayrollPeriodDetail } from "@/lib/payroll";

interface PayrollPeriodClientProps {
  initialDetail: AdminPayrollPeriodDetail;
  allPeriods?: Array<{ id: string; period_month: string; status: string }>;
}

function formatPeriodMonth(dateStr: string) {
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

export function PayrollPeriodClient({
  initialDetail,
  allPeriods = [],
}: PayrollPeriodClientProps) {
  const router = useRouter();
  const [detail, setDetail] = useState(initialDetail);
  const [newMonthInput, setNewMonthInput] = useState("");
  const [showNewMonthModal, setShowNewMonthModal] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const period = detail.period;
  const isPaid = period.status === "paid";
  const isClosed = period.status === "closed";
  const isOpen = period.status === "open";

  const handleClose = () => {
    setError(null);
    startTransition(async () => {
      const res = await closePeriodAction(period.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.data) {
        setDetail(res.data);
      }
      setConfirmClose(false);
    });
  };

  const handleMarkPaid = () => {
    setError(null);
    startTransition(async () => {
      const res = await markPeriodPaidAction(period.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.data) {
        setDetail(res.data);
      }
    });
  };

  const handleCreatePeriod = () => {
    if (!newMonthInput) return;
    setError(null);
    startTransition(async () => {
      const monthDate = `${newMonthInput}-01`;
      const res = await createPeriodAction(monthDate);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.data) {
        setShowNewMonthModal(false);
        setNewMonthInput("");
        router.push(`/admin/payroll?period=${res.data.id}`);
      }
    });
  };

  const handleAddAdjustment = async (input: {
    period_id: string;
    teacher_id: string;
    amount: number;
    reason: string;
  }) => {
    setError(null);
    const res = await addAdjustmentAction(input);
    if (res.error) {
      throw new Error(res.error);
    }
    if (res.data) {
      const newAdj = res.data;
      setDetail((prev) => {
        const nextAdjustments = [...prev.adjustments, newAdj];
        const nextEntries = prev.entries.map((entry) => {
          if (entry.teacher_id === input.teacher_id) {
            const nextAdjTotal = entry.adjustments_total + input.amount;
            return {
              ...entry,
              adjustments_total: nextAdjTotal,
              total_amount:
                entry.fee_sessions_total +
                entry.fixed_allowances_total +
                nextAdjTotal,
            };
          }
          return entry;
        });

        const nextTotals = nextEntries.reduce(
          (acc, item) => ({
            fee_sessions_total: acc.fee_sessions_total + item.fee_sessions_total,
            fixed_allowances_total:
              acc.fixed_allowances_total + item.fixed_allowances_total,
            adjustments_total: acc.adjustments_total + item.adjustments_total,
            total_amount: acc.total_amount + item.total_amount,
          }),
          {
            fee_sessions_total: 0,
            fixed_allowances_total: 0,
            adjustments_total: 0,
            total_amount: 0,
          }
        );

        return {
          ...prev,
          adjustments: nextAdjustments,
          entries: nextEntries,
          totals: nextTotals,
        };
      });
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Period Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary-50 text-primary-600">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Periode {formatPeriodMonth(period.period_month)}
                </h2>
                <p className="text-xs text-slate-500">
                  {detail.linesCount} sesi mengajar terdaftar · {detail.entries.length} guru
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {allPeriods.length > 0 && (
              <select
                aria-label="Pilih Periode Payroll"
                value={period.id}
                onChange={(e) => router.push(`/admin/payroll?period=${e.target.value}`)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
              >
                {allPeriods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatPeriodMonth(p.period_month)} ({p.status === "open" ? "Terbuka" : p.status === "closed" ? "Ditutup" : "Dibayar"})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setShowNewMonthModal(true)}
              className="px-2.5 py-1.5 rounded-xl border border-dashed border-primary-300 text-primary-700 hover:bg-primary-50 text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bulan Baru</span>
            </button>
            {isOpen && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Periode Terbuka
              </span>
            )}
            {isClosed && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                Periode Ditutup
              </span>
            )}
            {isPaid && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Sudah Dibayar
              </span>
            )}
          </div>
        </div>

        {/* KPI Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">
              Total Fee Sesi
            </span>
            <span className="text-base sm:text-lg font-extrabold text-slate-800">
              Rp {detail.totals.fee_sessions_total.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">
              Tunjangan Tetap
            </span>
            <span className="text-base sm:text-lg font-extrabold text-slate-800">
              Rp {detail.totals.fixed_allowances_total.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">
              Adjustment
            </span>
            <span
              className={`text-base sm:text-lg font-extrabold ${
                detail.totals.adjustments_total < 0
                  ? "text-rose-600"
                  : detail.totals.adjustments_total > 0
                  ? "text-emerald-600"
                  : "text-slate-800"
              }`}
            >
              Rp {detail.totals.adjustments_total.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="p-3 bg-primary-50 rounded-xl border border-primary-100">
            <span className="block text-[11px] font-bold text-primary-700 uppercase">
              Grand Total Payroll
            </span>
            <span className="text-base sm:text-lg font-black text-primary-900">
              Rp {detail.totals.total_amount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            {isOpen && (
              <span>
                Periode masih terbuka. Guru masih dapat mengisi kartu mengajar.
              </span>
            )}
            {isClosed && (
              <span>
                Periode sudah ditutup. Fee dan tunjangan terkunci sebagai snapshot.
              </span>
            )}
            {isPaid && (
              <span>
                Payroll sudah dicairkan. Seluruh data bersifat permanen dan tidak dapat diubah.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isOpen && !confirmClose && (
              <button
                type="button"
                onClick={() => setConfirmClose(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>Tutup Periode Payroll</span>
              </button>
            )}

            {isClosed && (
              <>
                <PayrollAdjustmentForm
                  periodId={period.id}
                  entries={detail.entries}
                  onSubmit={handleAddAdjustment}
                  disabled={isPaid}
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleMarkPaid}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tandai Sudah Dibayar</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* State-driven Close Confirmation Dialog */}
        {confirmClose && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Konfirmasi Penutupan Periode Payroll
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Apakah Anda yakin ingin menutup periode ini? Tindakan ini akan mengunci seluruh sesi
                  kartu mengajar yang telah disubmit dan membuat snapshot tunjangan tetap guru.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmClose(false)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100/80 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isPending ? "Menutup..." : "Konfirmasi Tutup Periode"}
              </button>
            </div>
          </div>
        )}

        {/* New Month Creation Modal */}
        {showNewMonthModal && (
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-2xl space-y-3">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-primary-900">
                  Buka Periode Payroll Bulan Baru
                </h4>
                <p className="text-xs text-primary-800 mt-1">
                  Pilih tahun dan bulan untuk membuat draft periode penggajian baru.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="month"
                    aria-label="Pilih Bulan Baru"
                    value={newMonthInput}
                    onChange={(e) => setNewMonthInput(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewMonthModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-primary-900 hover:bg-primary-100/80 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending || !newMonthInput}
                onClick={handleCreatePeriod}
                className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isPending ? "Memproses..." : "Buka Periode"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" />
            <h3 className="text-base font-bold text-slate-800">
              Rekapitulasi Honor per Guru
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {detail.entries.length} Guru
          </span>
        </div>

        {detail.entries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Belum ada data guru pada periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3">Nama Guru</th>
                  <th className="p-3 text-right">Fee Sesi</th>
                  <th className="p-3 text-right">Tunjangan</th>
                  <th className="p-3 text-right">Adjustment</th>
                  <th className="p-3 text-right">Total Honor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block text-sm">
                        {entry.teacher.full_name}
                      </span>
                      {entry.teacher.phone && (
                        <span className="text-[11px] text-slate-500">
                          {entry.teacher.phone}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-700">
                      Rp {entry.fee_sessions_total.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-700">
                      Rp {entry.fixed_allowances_total.toLocaleString("id-ID")}
                    </td>
                    <td
                      className={`p-3 text-right font-semibold ${
                        entry.adjustments_total < 0
                          ? "text-rose-600"
                          : entry.adjustments_total > 0
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      Rp {entry.adjustments_total.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-900 text-sm">
                      Rp {entry.total_amount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjustments Log */}
      {detail.adjustments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              <h3 className="text-base font-bold text-slate-800">
                Log Adjustment Periode
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {detail.adjustments.length} Catatan
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {detail.adjustments.map((adj) => {
              const teacherName =
                detail.entries.find((e) => e.teacher_id === adj.teacher_id)
                  ?.teacher.full_name || "Guru";
              return (
                <div key={adj.id} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">
                      {teacherName}
                    </span>
                    <span className="text-slate-500 text-xs mt-0.5 block">
                      {adj.reason}
                    </span>
                  </div>
                  <span
                    className={`font-extrabold text-sm ${
                      adj.amount < 0 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {adj.amount > 0 ? "+" : ""}Rp {adj.amount.toLocaleString("id-ID")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
