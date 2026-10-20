"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { AdminPayrollEntryItem } from "@/lib/payroll";

interface PayrollAdjustmentFormProps {
  periodId: string;
  entries: AdminPayrollEntryItem[];
  onSubmit: (input: {
    period_id: string;
    teacher_id: string;
    amount: number;
    reason: string;
  }) => Promise<void>;
  disabled?: boolean;
  onClose?: () => void;
}

export function PayrollAdjustmentForm({
  periodId,
  entries,
  onSubmit,
  disabled,
  onClose,
}: PayrollAdjustmentFormProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = onClose ? true : internalIsOpen;
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };
  const [teacherId, setTeacherId] = useState(entries[0]?.teacher_id || "");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (disabled) return null;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setInternalIsOpen(true);
          setError(null);
        }}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-[36px] rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
      >
        <Plus className="w-4 h-4 text-primary-600" />
        <span>+ Tambah Adjustment</span>
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount === 0) {
      setError("Nominal harus berupa angka bukan nol.");
      return;
    }
    if (!reason.trim()) {
      setError("Alasan adjustment wajib diisi.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        period_id: periodId,
        teacher_id: teacherId,
        amount: numAmount,
        reason: reason.trim(),
      });
      handleClose();
      setAmount("");
      setReason("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan adjustment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 shadow-2xs"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Tambah Adjustment Manual
        </h4>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 sm:p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Tutup form penyesuaian"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1" htmlFor="adj-teacher">
            Pilih Guru
          </label>
          <select
            id="adj-teacher"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-base sm:text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          >
            {entries.map((entry) => (
              <option key={entry.teacher_id} value={entry.teacher_id}>
                {entry.teacher.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1" htmlFor="adj-amount">
            Nominal Adjustment (Rp)
          </label>
          <input
            id="adj-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Contoh: 25000 atau -10000"
            className="w-full px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-base sm:text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1" htmlFor="adj-reason">
            Alasan Adjustment
          </label>
          <input
            id="adj-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Kompensasi cancel murid"
            className="w-full px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-base sm:text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={handleClose}
          className="w-full sm:w-auto px-4 py-2 min-h-[44px] sm:min-h-[36px] text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-full transition-colors inline-flex items-center justify-center"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-5 py-2 min-h-[44px] sm:min-h-[36px] text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-full shadow-2xs transition-colors disabled:opacity-50 inline-flex items-center justify-center"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Adjustment"}
        </button>
      </div>
    </form>
  );
}
