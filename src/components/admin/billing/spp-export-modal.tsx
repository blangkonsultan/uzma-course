"use client";

import { useEffect, useRef } from "react";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const report = groupInvoicesByStudent(invoices);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const printDateStr = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 print:static print:p-0 print:bg-transparent"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * {
            visibility: hidden !important;
          }
          #spp-export-print-area, #spp-export-print-area * {
            visibility: visible !important;
          }
          #spp-export-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>

      <div
        ref={dialogRef}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none print:max-h-none print:rounded-none"
      >
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary-100 text-primary-700">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="export-modal-title"
                className="text-xs sm:text-sm font-bold text-slate-900"
              >
                Pratinjau Export Rekap SPP
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {report.total_students} Murid · {report.total_programs} Program ·{" "}
                {branchName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={report.total_students === 0}
              className="px-3.5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Tutup pratinjau export"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div
          id="spp-export-print-area"
          className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white font-sans text-xs print:p-0 print:overflow-visible"
        >
          {/* Header Kop Dokumen */}
          <div className="flex items-start justify-between border-b-2 border-primary-900 pb-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-uzma-course.jpg"
                alt="Logo Uzma Course"
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-primary-950 uppercase">
                  Uzma Course
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Lembaga Bimbingan Belajar & Les Privat Terpadu
                </p>
                <p className="text-[11px] text-slate-500">
                  Laporan Rekapitulasi Tagihan SPP Siswa
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-600 space-y-0.5">
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
              <div className="text-[10px] text-slate-400 pt-1">
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
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-300 text-slate-700 font-bold">
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3">Murid / Program Belajar</th>
                      <th className="py-2.5 px-3">Wali & Kontak</th>
                      <th className="py-2.5 px-3 text-center">Jatuh Tempo</th>
                      <th className="py-2.5 px-3 text-right">Tagihan</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {report.grouped_students.map(
                      (student: GroupedStudentBilling, index: number) => (
                        <StudentBillingGroupRows
                          key={student.student_id}
                          student={student}
                          index={index + 1}
                        />
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Ringkasan Finansial Bawah */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="space-y-1 text-[11px] text-slate-600">
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

                <div className="min-w-[240px] border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-3 sm:pt-0 space-y-1.5 text-right text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Total Tagihan ({report.total_programs} program):
                    </span>
                    <span className="font-bold text-slate-900">
                      Rp {report.total_invoiced.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Kas Masuk (Lunas):</span>
                    <span className="font-bold">
                      Rp {report.total_paid.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-800 font-bold border-t border-slate-200 pt-1.5 text-xs">
                    <span>Sisa Piutang Tertunggak:</span>
                    <span>
                      Rp {report.total_outstanding.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="flex justify-between items-end pt-6 text-[11px] text-slate-600">
                <div className="text-[10px] text-slate-400">
                  Dokumen ini dihasilkan secara otomatis oleh Sistem Manajemen Uzma Course.
                </div>
                <div className="text-center w-48 space-y-12">
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
    <>
      {/* Baris Induk Siswa */}
      <tr className="bg-slate-50/70 font-semibold border-t-2 border-slate-300">
        <td className="py-2 px-3 text-center text-slate-500 text-[10px]">
          {index}
        </td>
        <td className="py-2 px-3" colSpan={3}>
          <div className="flex items-center gap-2">
            <span className="text-primary-950 font-bold text-xs">
              {student.student_name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              (NIS: {student.student_number})
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              · {student.branch_name}
            </span>
            {student.programs_count > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-primary-100 text-primary-800 text-[9px] font-bold">
                {student.programs_count} Program
              </span>
            )}
          </div>
        </td>
        <td className="py-2 px-3 text-right font-bold text-primary-950">
          Rp {student.total_invoiced.toLocaleString("id-ID")}
        </td>
        <td className="py-2 px-3 text-center">
          {student.status === "paid" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
              <CheckCircle2 className="w-2.5 h-2.5" />
              LUNAS
            </span>
          )}
          {student.status === "unpaid" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold">
              <Clock className="w-2.5 h-2.5" />
              BELUM BAYAR
            </span>
          )}
          {student.status === "partial" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[9px] font-bold">
              <Clock className="w-2.5 h-2.5" />
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
            className="hover:bg-slate-50/50 transition-colors text-[10px] text-slate-700"
          >
            <td></td>
            <td className="py-1.5 px-3 pl-6">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">↳</span>
                <span className="font-medium text-slate-900">
                  {inv.program?.name}
                </span>
                <span className="text-slate-500">
                  ({inv.variant?.name})
                </span>
                <span className="text-slate-400 text-[9px]">
                  · {inv.invoice_number}
                </span>
              </div>
            </td>
            <td className="py-1.5 px-3 text-slate-600">
              {student.parent_name || "-"}
              {student.parent_phone && (
                <span className="text-slate-400 block text-[9px]">
                  {student.parent_phone}
                </span>
              )}
            </td>
            <td className="py-1.5 px-3 text-center text-slate-600">
              {formatDateIndo(inv.due_date)}
            </td>
            <td className="py-1.5 px-3 text-right font-medium text-slate-900">
              Rp {inv.total_amount.toLocaleString("id-ID")}
            </td>
            <td className="py-1.5 px-3 text-center">
              {isPaid ? (
                <span className="text-emerald-700 font-bold text-[9px]">
                  Lunas ({formatDateIndo(inv.payment?.payment_date)})
                </span>
              ) : (
                <span className="text-amber-700 font-bold text-[9px]">
                  Belum Bayar
                </span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}
