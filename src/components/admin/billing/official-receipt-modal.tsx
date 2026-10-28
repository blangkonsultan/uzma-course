"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const payment = invoice.payment;

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    dialog?.showModal();
    document.body.setAttribute("data-receipt-modal-open", "");

    return () => {
      document.body.removeAttribute("data-receipt-modal-open");
      dialog?.close();
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      id="official-receipt-modal"
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-3 text-slate-900 backdrop:bg-slate-900/60 open:flex open:items-center open:justify-center"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
      }}
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <style>{`
        body[data-receipt-modal-open] {
          overflow: hidden;
        }
        body[data-receipt-modal-open] > :not(#official-receipt-modal) {
          overflow: clip;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            margin: 0 !important;
            background: white !important;
            overflow: visible !important;
          }
          body > :not(#official-receipt-modal) {
            display: none !important;
          }
          body[data-receipt-modal-open] > :not(#official-receipt-modal) {
            display: none !important;
          }
          #official-receipt-modal, #official-receipt-modal * {
            animation: none !important;
            transition: none !important;
          }
          #official-receipt-modal {
            position: static !important;
            display: block !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            margin: 0 !important;
            overflow: visible !important;
            padding: 0 !important;
            background: transparent !important;
            backdrop-filter: none !important;
          }
          #official-receipt-modal::backdrop {
            display: none !important;
          }
          #official-receipt-modal > div {
            display: block !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          #official-receipt-modal [data-receipt-preview-scroll] {
            display: block !important;
            overflow: visible !important;
            padding: 0 !important;
            background: transparent !important;
          }
          #receipt-print-area {
            position: static !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            overflow: visible !important;
            padding: 0 !important;
            background: white !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #receipt-print-area table {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #receipt-print-area tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="flex max-h-full w-full min-w-0 max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Controls Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 aria-hidden="true" className="size-4" />
            </span>
            <h2 id="receipt-modal-title" className="truncate text-xs font-bold text-slate-800 sm:text-sm">
              Kwitansi Pembayaran Resmi
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="min-h-11 sm:min-h-9"
            >
              <Printer aria-hidden="true" className="size-3.5 shrink-0" />
              <span>Cetak Kwitansi</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-11 shrink-0 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:size-9"
              aria-label="Tutup kwitansi"
            >
              <X aria-hidden="true" className="size-5 sm:size-4" />
            </Button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div
          data-receipt-preview-scroll
          tabIndex={0}
          aria-label="Dokumen kwitansi pembayaran resmi"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-600"
        >
          <div
            id="receipt-print-area"
            className="space-y-6 text-slate-900 bg-white font-sans"
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
          <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
            <table className="min-w-[32rem] sm:min-w-0 w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase">
                  <th className="p-3">Program & Siklus Pembelajaran</th>
                  <th className="p-3 text-right whitespace-nowrap">Biaya Paket</th>
                  <th className="p-3 text-right whitespace-nowrap">Potongan / Diskon</th>
                  <th className="p-3 text-right whitespace-nowrap">Jumlah Dibayar</th>
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
                  <td className="p-3 text-right font-medium text-slate-700 whitespace-nowrap tabular-nums">
                    Rp{"\u00a0"}{invoice.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-right font-medium text-emerald-700 whitespace-nowrap tabular-nums">
                    {invoice.discount_amount > 0
                      ? `- Rp\u00a0${invoice.discount_amount.toLocaleString("id-ID")}`
                      : "Rp\u00a00"}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 whitespace-nowrap tabular-nums">
                    Rp{"\u00a0"}{invoice.total_amount.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td colSpan={3} className="p-3 text-right uppercase text-slate-700">
                    Total Pelunasan
                  </td>
                  <td className="p-3 text-right text-sm font-black text-emerald-800 whitespace-nowrap tabular-nums">
                    Rp{"\u00a0"}{invoice.total_amount.toLocaleString("id-ID")}
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
    </dialog>,
    document.body
  );
}
