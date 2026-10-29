"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { recordPaymentAction } from "@/app/admin/spp/actions";
import type { StudentInvoiceItem } from "@/lib/billing";

interface PaymentModalProps {
  invoice: StudentInvoiceItem;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Tunai (Cash di Cabang)" },
  { value: "transfer_bca", label: "Transfer Bank BCA" },
  { value: "transfer_bri", label: "Transfer Bank BRI" },
  { value: "transfer_mandiri", label: "Transfer Bank Mandiri" },
  { value: "qris", label: "QRIS / E-Wallet" },
  { value: "other", label: "Lainnya" },
] as const;

export function PaymentModal({
  invoice,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentModalProps["invoice"]["payment"] extends null ? string : string>("cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = originalOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await recordPaymentAction({
        invoice_id: invoice.id,
        payment_method: paymentMethod as never,
        payment_date: paymentDate,
        payment_reference: paymentReference.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
        return;
      }

      onSuccess();
    });
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      id="payment-modal"
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-4 text-slate-900 backdrop:bg-slate-900/50 open:flex open:items-center open:justify-center"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top, 0px))",
        paddingRight: "max(1rem, env(safe-area-inset-right, 0px))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
        paddingLeft: "max(1rem, env(safe-area-inset-left, 0px))",
      }}
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!isPending) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3
              id="payment-modal-title"
              className="text-base font-bold text-slate-900"
            >
              Catat Pembayaran SPP
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {invoice.invoice_number} · {invoice.student?.full_name}
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="p-2 sm:p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Tutup form pembayaran"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Invoice Summary Box */}
          <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-primary-800 uppercase tracking-wider block">
                Total Tagihan Pelunasan
              </span>
              <span className="text-xl font-extrabold text-primary-950 mt-0.5 block">
                Rp {invoice.total_amount.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-primary-700 mt-1 block">
                {invoice.program?.name} ({invoice.variant?.name})
              </span>
            </div>
            <div className="text-right text-xs text-slate-600">
              <span className="block font-medium">Siklus #{invoice.cycle_number}</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">
                {invoice.period_start} s/d {invoice.period_end}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 text-xs">
            <div>
              <label
                htmlFor="pay-date"
                className="block font-semibold text-slate-700 mb-1"
              >
                Tanggal Pembayaran <span className="text-rose-500">*</span>
              </label>
              <input
                id="pay-date"
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] rounded-xl border border-slate-200 bg-white text-slate-800 text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="pay-method"
                className="block font-semibold text-slate-700 mb-1"
              >
                Metode Pembayaran <span className="text-rose-500">*</span>
              </label>
              <select
                id="pay-method"
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] rounded-xl border border-slate-200 bg-white text-slate-800 text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="pay-ref"
                className="block font-semibold text-slate-700 mb-1"
              >
                Nomor Referensi Transfer / Struk (Opsional)
              </label>
              <input
                id="pay-ref"
                type="text"
                placeholder="Contoh: BCA-9842 atau No. Mutasi"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] rounded-xl border border-slate-200 bg-white text-slate-800 text-base sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="pay-notes"
                className="block font-semibold text-slate-700 mb-1"
              >
                Catatan Transaksi (Opsional)
              </label>
              <textarea
                id="pay-notes"
                rows={2}
                placeholder="Catatan tambahan pembayaran..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] rounded-xl border border-slate-200 bg-white text-slate-800 text-base sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons: Primary first on mobile, side-by-side on sm: */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors inline-flex items-center justify-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[36px] text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Simpan Pembayaran & Terbitkan Kwitansi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>,
    document.body
  );
}
