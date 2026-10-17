"use client";

import { useRouter } from "next/navigation";

interface PeriodOption {
  id: string;
  period_month: string;
  status: string;
}

interface HonorPeriodSelectProps {
  periods: PeriodOption[];
  currentPeriodId?: string;
}

function formatMonthIndo(dateStr: string) {
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

export function HonorPeriodSelect({
  periods,
  currentPeriodId,
}: HonorPeriodSelectProps) {
  const router = useRouter();

  if (!periods || periods.length === 0) return null;

  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
      <label
        htmlFor="honor-period-select"
        className="text-xs font-semibold text-slate-600 shrink-0"
      >
        Periode:
      </label>
      <select
        id="honor-period-select"
        aria-label="Pilih Periode Honor"
        value={currentPeriodId || ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val) {
            router.push(`/guru/honor?period=${val}`);
          } else {
            router.push("/guru/honor");
          }
        }}
        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">Bulan Ini (Estimasi Berjalan)</option>
        {periods.map((p) => (
          <option key={p.id} value={p.id}>
            {formatMonthIndo(p.period_month)} (
            {p.status === "open"
              ? "Berjalan"
              : p.status === "closed"
              ? "Ditutup"
              : "Sudah Ditransfer"}
            )
          </option>
        ))}
      </select>
    </div>
  );
}
