"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, Video } from "lucide-react";

export function VideoGuideCard() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-primary-50/70 border border-primary-200/80 rounded-2xl overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-primary-100/50 hover:bg-primary-100/80 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 font-heading">
              Panduan Cara Mengambil ID Video (TikTok & YouTube)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              URL dasar sudah dipatenkan otomatis — Anda hanya perlu memasukkan ID videonya saja.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary-700 text-xs font-semibold shrink-0 ml-3">
          <span className="hidden sm:inline">
            {isOpen ? "Tutup Panduan" : "Buka Panduan"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-6 text-xs sm:text-sm border-t border-primary-200/60 bg-white/70">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Panduan TikTok */}
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Platform TikTok (Format Vertikal)
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-semibold">
                  tiktok.com
                </span>
              </div>

              <ol className="space-y-2.5 text-slate-700 list-decimal list-inside leading-relaxed">
                <li>
                  Buka link video dari aplikasi TikTok atau shortlink (misal:{" "}
                  <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px] font-mono">
                    https://vt.tiktok.com/ZSbAGHk5s/
                  </code>
                  ).
                </li>
                <li>
                  Di browser, link tersebut otomatis diarahkan ke URL lengkap:
                  <div className="mt-1 p-2 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono break-all text-slate-700">
                    https://www.tiktok.com/@uzmacourse/video/
                    <strong className="text-primary-700 font-bold bg-primary-100 px-1 py-0.5 rounded">
                      7683120078589611285
                    </strong>
                  </div>
                </li>
                <li>
                  Salin deretan angka di belakang <code>/video/</code>, yaitu:{" "}
                  <strong className="text-primary-700 font-mono font-bold">
                    7683120078589611285
                  </strong>
                  .
                </li>
                <li>
                  Masukkan angka tersebut ke kolom <strong>ID Video</strong> di bawah. URL dasar (
                  <code className="text-[11px] font-mono text-slate-600">
                    https://www.tiktok.com/player/v1/
                  </code>
                  ) sudah terpasang otomatis.
                </li>
              </ol>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Fitur Otomatis:</strong> Anda juga bisa langsung menempelkan (paste) link lengkap atau link <code>vt.tiktok.com</code> ke kolom ID, lalu tekan tombol <em>Ekstrak ID</em> untuk pengisian otomatis.
                </span>
              </div>
            </div>

            {/* Panduan YouTube */}
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/90 border border-slate-200/80">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                  Platform YouTube (Format Landscape)
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-semibold">
                  youtube.com
                </span>
              </div>

              <ol className="space-y-2.5 text-slate-700 list-decimal list-inside leading-relaxed">
                <li>
                  Buka video di YouTube pada browser Anda (misal link:{" "}
                  <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px] font-mono">
                    https://www.youtube.com/watch?v=M7lc1UVf-VE
                  </code>
                  ).
                </li>
                <li>
                  Ambil 11 karakter kode ID setelah <code>v=</code> atau setelah{" "}
                  <code>youtu.be/</code>:
                  <div className="mt-1 p-2 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono break-all text-slate-700">
                    https://www.youtube.com/watch?v=
                    <strong className="text-primary-700 font-bold bg-primary-100 px-1 py-0.5 rounded">
                      M7lc1UVf-VE
                    </strong>
                  </div>
                </li>
                <li>
                  Salin kode 11 karakter tersebut, yaitu:{" "}
                  <strong className="text-primary-700 font-mono font-bold">
                    M7lc1UVf-VE
                  </strong>
                  .
                </li>
                <li>
                  Masukkan ke kolom <strong>ID Video</strong> di bawah. URL dasar (
                  <code className="text-[11px] font-mono text-slate-600">
                    https://www.youtube.com/embed/
                  </code>
                  ) sudah terpasang otomatis.
                </li>
              </ol>

              <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-start gap-2">
                <Video className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Auto-Sanitasi:</strong> Jika Anda menempelkan URL YouTube lengkap (termasuk link YouTube Shorts), sistem akan otomatis mengambil kode ID 11 karakternya.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
