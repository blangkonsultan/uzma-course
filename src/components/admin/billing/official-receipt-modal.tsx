"use client";

import { useEffect, useRef } from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";
import type { StudentInvoiceItem } from "@/lib/billing";

interface OfficialReceiptModalProps {
  invoice: StudentInvoiceItem;
  onClose: () => void;
}

function formatDateIndo(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(`${dateStr}T00:00:00Z`);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatPaymentMethodLabel(method?: string | null) {
  switch (method) {
    case "cash":
      return "Tunai (Cash)";
    case "transfer_bca":
      return "Transfer Bank BCA";
    case "transfer_bri":
      return "Transfer Bank BRI";
    case "transfer_mandiri":
      return "Transfer Bank Mandiri";
    case "qris":
      return "QRIS";
    default:
      return method || "Tunai";
  }
}

export function OfficialReceiptModal({
  invoice,
  onClose,
}: OfficialReceiptModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const payment = invoice.payment;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-800">
              Kwitansi Pembayaran Resmi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kwitansi</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Tutup kwitansi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div
          id="receipt-print-area"
          className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white font-sans"
        >
          {/* Organization Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-uzma-course.jpg"
                alt="Logo Uzma Course"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                  Uzma Course
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Bimbingan Belajar Ramah Anak & Bebas Trauma
                </p>
                <p className="text-[11px] text-slate-500">
                  {invoice.branch?.name} · Sidoarjo, Jawa Timur
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-md">
                LUNAS
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {payment?.receipt_number || "RCT-PENDING"}
              </p>
              <p className="text-[11px] text-slate-500">
                Ref: {invoice.invoice_number}
              </p>
            </div>
          </div>

          {/* Student & Payment Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                Diterima Dari
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {invoice.student?.full_name}
              </p>
              <p className="text-slate-600">
                No. Induk (NIS): <span className="font-mono font-bold text-slate-800">{invoice.student?.student_number}</span>
              </p>
              {invoice.student?.parent_name && (
                <p className="text-slate-500">
                  Orang Tua / Wali: {invoice.student.parent_name}
                </p>
              )}
            </div>

            <div className="space-y-1 text-right">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">
                Detail Transaksi
              </span>
              <p className="text-slate-700">
                Tgl Bayar: <span className="font-bold">{formatDateIndo(payment?.payment_date || invoice.updated_at)}</span>
              </p>
              <p className="text-slate-700">
                Metode: <span className="font-bold">{formatPaymentMethodLabel(payment?.payment_method)}</span>
              </p>
              {payment?.payment_reference && (
                <p className="text-slate-500 text-[11px]">
                  Ref Transfer: {payment.payment_reference}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase">
                  <th className="p-3">Program & Siklus Pembelajaran</th>
                  <th className="p-3 text-right">Biaya Paket</th>
                  <th className="p-3 text-right">Potongan / Diskon</th>
                  <th className="p-3 text-right">Jumlah Dibayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3">
                    <p className="font-bold text-slate-900">
                      {invoice.program?.name} — {invoice.variant?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Siklus #{invoice.cycle_number} (28 Hari): {formatDateIndo(invoice.period_start)} s/d {formatDateIndo(invoice.period_end)}
                    </p>
                  </td>
                  <td className="p-3 text-right font-medium text-slate-700">
                    Rp {invoice.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-right font-medium text-emerald-700">
                    {invoice.discount_amount > 0
                      ? `- Rp ${invoice.discount_amount.toLocaleString("id-ID")}`
                      : "Rp 0"}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    Rp {invoice.total_amount.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td colSpan={3} className="p-3 text-right uppercase text-slate-700">
                    Total Pelunasan
                  </td>
                  <td className="p-3 text-right text-sm font-black text-emerald-800">
                    Rp {invoice.total_amount.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer & Signature Section */}
          <div className="flex items-end justify-between pt-4 text-xs">
            <div className="max-w-xs space-y-1 text-[11px] text-slate-500">
              <p className="font-bold text-slate-700">Catatan:</p>
              <p>
                Kwitansi ini merupakan bukti pembayaran resmi yang sah diterbitkan oleh sistem manajemen Uzma Course.
              </p>
              {payment?.notes && <p className="italic text-slate-600">&ldquo;{payment.notes}&rdquo;</p>}
            </div>

            <div className="text-center w-44 space-y-12">
              <p className="text-slate-600">
                Sidoarjo, {formatDateIndo(payment?.payment_date || invoice.updated_at)}
              </p>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                Admin Keuangan
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
