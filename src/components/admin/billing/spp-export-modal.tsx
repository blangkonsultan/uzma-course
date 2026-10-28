"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Printer,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  groupInvoicesByStudent,
  type GroupedStudentBilling,
} from "@/lib/billing-helpers";
import type { StudentInvoiceItem } from "@/lib/billing";
import { Button } from "@/components/ui/button";

interface SppExportModalProps {
  invoices: StudentInvoiceItem[];
  branchName?: string;
  statusFilter?: string;
  searchFilter?: string;
  onClose: () => void;
}

function formatDateIndo(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00Z`);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  } catch {
    return dateStr;
  }
}

function formatStatusFilterLabel(status?: string): string {
  switch (status) {
    case "unpaid":
      return "Belum Bayar (Menunggu Pembayaran)";
    case "paid":
      return "Lunas Terbayar";
    default:
      return "Semua Status (Lunas & Belum Bayar)";
  }
}

export function SppExportModal({
  invoices,
  branchName = "Semua Cabang",
  statusFilter = "all",
  searchFilter = "",
  onClose,
}: SppExportModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const report = groupInvoicesByStudent(invoices);

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    dialog?.showModal();
    document.body.setAttribute("data-spp-export-open", "");

    return () => {
      document.body.removeAttribute("data-spp-export-open");
      dialog?.close();
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
    };
  }, []);
  const printDateStr = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  // Opened by the client-side export action; keep print layout outside the app shell.
  return createPortal(
    <dialog
      ref={dialogRef}
      id="spp-export-modal"
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-3 text-slate-900 backdrop:bg-slate-900/60 open:flex open:items-center open:justify-center"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
      }}
      aria-modal="true"
      aria-labelledby="export-modal-title"
      aria-describedby="spp-export-preview-hint"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <style>{`
        body:has(#spp-export-modal[open]) {
          overflow: hidden;
        }
        body:has(#spp-export-modal[open]) > :not(#spp-export-modal) {
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
          body > :not(#spp-export-modal) {
            display: none !important;
          }
          #spp-export-modal, #spp-export-modal * {
            animation: none !important;
            transition: none !important;
          }
          #spp-export-modal {
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
          #spp-export-modal::backdrop {
            display: none !important;
          }
          #spp-export-modal > div {
            display: block !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          #spp-export-modal [data-spp-preview-scroll] {
            display: block !important;
            overflow: visible !important;
            padding: 0 !important;
            background: transparent !important;
          }
          #spp-export-print-area {
            position: static !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            overflow: visible !important;
            padding: 0 !important;
            background: white !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          #spp-export-print-area [data-spp-table-frame] {
            overflow: visible !important;
            border-radius: 0 !important;
          }
          #spp-export-print-area thead {
            display: table-header-group;
          }
          #spp-export-print-area tbody,
          #spp-export-print-area tr,
          #spp-export-print-area [data-spp-summary],
          #spp-export-print-area [data-spp-signature] {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="flex max-h-full w-full min-w-0 max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Controls Bar */}
        <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 border-b border-slate-200 bg-white px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 sm:flex">
              <FileSpreadsheet aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 id="export-modal-title" className="text-balance text-sm font-semibold leading-snug text-slate-900">
                Pratinjau Export Rekap SPP
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {report.total_students} Murid · {report.total_programs} Program · {branchName}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="col-start-2 row-start-1 size-11 shrink-0 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:col-start-3"
            aria-label="Tutup pratinjau export"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => window.print()}
            disabled={report.total_students === 0}
            className="col-span-2 min-h-11 w-full whitespace-nowrap text-sm sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:w-auto"
          >
            <Printer aria-hidden="true" className="size-4 shrink-0" />
            Cetak / Simpan PDF
          </Button>
          <p id="spp-export-preview-hint" className="col-span-2 text-pretty text-xs leading-relaxed text-slate-600 sm:col-span-3">
            Geser pratinjau untuk melihat seluruh kolom. PDF dicetak dalam ukuran A4.
          </p>
        </div>

        {/* Printable Area */}
        <div
          data-spp-preview-scroll
          role="region"
          aria-label="Pratinjau dokumen rekap SPP"
          tabIndex={0}
          className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain bg-slate-100 p-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-600 sm:p-5"
        >
        <div
          id="spp-export-print-area"
          className="mx-auto min-w-[44rem] space-y-6 rounded-xl bg-white p-5 font-sans text-xs text-slate-900 shadow-sm sm:p-6"
        >
          {/* Header Kop Dokumen */}
          <div className="flex items-start justify-between gap-6 border-b-2 border-primary-900 pb-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-uzma-course.jpg"
                alt="Logo Uzma Course"
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-primary-950 uppercase">
                  Uzma Course
                </h1>
                <p className="text-pretty text-xs font-medium leading-relaxed text-slate-600">
                  Lembaga Bimbingan Belajar & Les Privat Terpadu
                </p>
                <p className="text-[11px] text-slate-500">
                  Laporan Rekapitulasi Tagihan SPP Siswa
                </p>
              </div>
            </div>

            <div className="w-60 shrink-0 space-y-1 text-right text-[11px] leading-relaxed text-slate-600">
              <div>
                <span className="text-slate-500">Cabang:</span>{" "}
                <strong className="text-slate-900">{branchName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{" "}
                <span className="font-medium">
                  {formatStatusFilterLabel(statusFilter)}
                </span>
              </div>
              {searchFilter && (
                <div>
                  <span className="text-slate-500">Pencarian:</span>{" "}
                  <span className="font-medium italic">
                    &ldquo;{searchFilter}&rdquo;
                  </span>
                </div>
              )}
              <div className="pt-1 text-[10px] tabular-nums text-slate-500">
                Dicetak: {printDateStr} WIB
              </div>
            </div>
          </div>

          {/* Report Content */}
          {report.grouped_students.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2 border border-dashed border-slate-200 rounded-xl">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">
                Tidak ada data tagihan SPP pada filter ini
              </p>
              <p className="text-[11px]">
                Silakan sesuaikan filter cabang, status, atau kata kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div data-spp-table-frame className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left text-[11px] leading-relaxed">
                  <caption className="sr-only">Rekap tagihan SPP per murid dan program belajar</caption>
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-100 font-semibold text-slate-700">
                      <th scope="col" className="w-10 px-3 py-3 text-center">No</th>
                      <th scope="col" className="px-3 py-3">Murid / Program Belajar</th>
                      <th scope="col" className="px-3 py-3">Wali & Kontak</th>
                      <th scope="col" className="px-3 py-3 text-center">Jatuh Tempo</th>
                      <th scope="col" className="px-3 py-3 text-right">Tagihan</th>
                      <th scope="col" className="px-3 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                    {report.grouped_students.map(
                      (student: GroupedStudentBilling, index: number) => (
                        <StudentBillingGroupRows
                          key={student.student_id}
                          student={student}
                          index={index + 1}
                        />
                      )
                    )}
                </table>
              </div>

              {/* Ringkasan Finansial Bawah */}
              <div data-spp-summary className="flex items-start justify-between gap-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="min-w-0 flex-1 space-y-1 text-pretty text-[11px] leading-relaxed text-slate-600">
                  <p className="font-bold text-slate-800">
                    Informasi Pembayaran Cabang:
                  </p>
                  <p>
                    Pembayaran tunai dapat dilakukan langsung di kantor cabang
                    operasional Uzma Course.
                  </p>
                  <p>
                    Transfer rekening resmi:{" "}
                    <strong className="text-slate-900">
                      BCA: 8910-234-567 a.n Uzma Course
                    </strong>
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    *Harap kirimkan bukti transfer kepada admin cabang untuk
                    penerbitan kwitansi resmi.
                  </p>
                </div>

                <dl className="grid w-72 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 border-l border-slate-200 pl-4 text-[11px] leading-relaxed">
                  <dt className="text-slate-600">
                    Total Tagihan ({report.total_programs} program):
                  </dt>
                  <dd className="whitespace-nowrap text-right font-semibold tabular-nums text-slate-900">
                    Rp{"\u00a0"}{report.total_invoiced.toLocaleString("id-ID")}
                  </dd>
                  <dt className="text-emerald-700">Kas Masuk (Lunas):</dt>
                  <dd className="whitespace-nowrap text-right font-semibold tabular-nums text-emerald-700">
                    Rp{"\u00a0"}{report.total_paid.toLocaleString("id-ID")}
                  </dd>
                  <dt className="border-t border-slate-200 pt-2 font-semibold text-amber-900">
                    Sisa Piutang Tertunggak:
                  </dt>
                  <dd className="whitespace-nowrap border-t border-slate-200 pt-2 text-right font-bold tabular-nums text-amber-900">
                    Rp{"\u00a0"}{report.total_outstanding.toLocaleString("id-ID")}
                  </dd>
                </dl>
              </div>

              {/* Tanda Tangan */}
              <div data-spp-signature className="flex items-end justify-between gap-8 pt-6 text-[11px] text-slate-600">
                <div className="max-w-sm text-pretty text-[10px] leading-relaxed text-slate-500">
                  Dokumen ini dihasilkan secara otomatis oleh Sistem Manajemen Uzma Course.
                </div>
                <div className="w-44 shrink-0 space-y-12 text-center">
                  <p>
                    Sidoarjo, {formatDateIndo(new Date().toISOString().split("T")[0])}
                  </p>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                    Admin Operasional SPP
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </dialog>,
    document.body
  );
}

function StudentBillingGroupRows({
  student,
  index,
}: {
  student: GroupedStudentBilling;
  index: number;
}) {
  return (
    <tbody className="divide-y divide-slate-200">
      {/* Baris Induk Siswa */}
      <tr className="border-t border-slate-300 bg-slate-50 font-semibold">
        <td className="py-2 px-3 text-center text-slate-500 text-[10px]">
          {index}
        </td>
        <th scope="rowgroup" className="px-3 py-2 text-left" colSpan={3}>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-xs font-semibold text-primary-950">
              {student.student_name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              (NIS: {student.student_number})
            </span>
            <span className="text-[10px] font-normal text-slate-500">
              · {student.branch_name}
            </span>
            {student.programs_count > 1 && (
              <span className="whitespace-nowrap rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-800">
                {student.programs_count} Program
              </span>
            )}
          </div>
        </th>
        <td className="whitespace-nowrap px-3 py-2 text-right font-semibold tabular-nums text-primary-950">
          Rp{"\u00a0"}{student.total_invoiced.toLocaleString("id-ID")}
        </td>
        <td className="py-2 px-3 text-center">
          {student.status === "paid" && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <CheckCircle2 aria-hidden="true" className="size-3" />
              LUNAS
            </span>
          )}
          {student.status === "unpaid" && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
              <Clock aria-hidden="true" className="size-3" />
              BELUM BAYAR
            </span>
          )}
          {student.status === "partial" && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
              <Clock aria-hidden="true" className="size-3" />
              SEBAGIAN
            </span>
          )}
        </td>
      </tr>

      {/* Sub-baris per Program Belajar */}
      {student.invoices.map((inv) => {
        const isPaid = inv.status === "paid";
        return (
          <tr
            key={inv.id}
            className="text-[11px] text-slate-700"
          >
            <td></td>
            <td className="px-3 py-2 pl-6">
              <div className="space-y-0.5">
                <p className="font-medium text-slate-900">{inv.program?.name}</p>
                <p className="text-[10px] text-slate-600">({inv.variant?.name})</p>
                <p className="whitespace-nowrap text-[10px] tabular-nums text-slate-500">
                  {inv.invoice_number}
                </p>
              </div>
            </td>
            <td className="py-1.5 px-3 text-slate-600">
              {student.parent_name || "-"}
              {student.parent_phone && (
                <span className="block whitespace-nowrap text-[10px] tabular-nums text-slate-500">
                  {student.parent_phone}
                </span>
              )}
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-center text-[10px] tabular-nums text-slate-600">
              {formatDateIndo(inv.due_date)}
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums text-slate-900">
              Rp{"\u00a0"}{inv.total_amount.toLocaleString("id-ID")}
            </td>
            <td className="py-1.5 px-3 text-center">
              {isPaid ? (
                <span className="text-[10px] font-semibold text-emerald-700">
                  Lunas
                  <span className="block whitespace-nowrap tabular-nums">
                    ({formatDateIndo(inv.payment?.payment_date)})
                  </span>
                </span>
              ) : (
                <span className="whitespace-nowrap text-[10px] font-semibold text-amber-900">
                  Belum Bayar
                </span>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}
