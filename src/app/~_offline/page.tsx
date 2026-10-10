"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-sm border border-rose-100">
        <WifiOff className="w-10 h-10" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Koneksi Terputus</h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
          Aplikasi tidak dapat menjangkau server. Halaman ini mungkin belum tersimpan di memori offline HP Anda.
        </p>
      </div>

      <div className="flex flex-col w-full max-w-xs space-y-3 pt-4">
        <Link 
          href="/guru/absen"
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors shadow-2xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Coba Buka Absensi</span>
        </Link>
        <button 
          type="button"
          onClick={() => window.location.reload()}
          className="w-full text-slate-500 font-medium py-3 text-sm hover:text-slate-700 transition-colors"
        >
          Muat Ulang Halaman
        </button>
      </div>
    </div>
  );
}
