"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export function PrintActionBar({ backUrl }: { backUrl: string }) {
  return (
    <div className="print:hidden fixed top-0 left-0 w-full bg-slate-800 text-white p-4 flex justify-between items-center shadow-lg z-50">
      <div className="flex items-center gap-3">
        <Link 
          href={backUrl} 
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Papan
        </Link>
      </div>
      <button 
        type="button"
        onClick={() => window.print()}
        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
      >
        <Printer className="w-4 h-4" />
        Cetak Ulang
      </button>
    </div>
  );
}
