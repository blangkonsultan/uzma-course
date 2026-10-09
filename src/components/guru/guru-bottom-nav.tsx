"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, User, CalendarDays, Wallet } from "lucide-react";

export function GuruBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto h-16 relative px-1">
        {/* 1. Beranda */}
        <Link
          href="/guru"
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            pathname === "/guru" ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
          }`}
        >
          <Home className={`w-5 h-5 mb-1 ${pathname === "/guru" ? "fill-blue-100" : ""}`} />
          <span className="text-[9px] font-medium leading-none">Beranda</span>
        </Link>

        {/* 2. Jadwal */}
        <Link
          href="/guru/jadwal"
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            pathname === "/guru/jadwal" ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
          }`}
        >
          <CalendarDays className={`w-5 h-5 mb-1 ${pathname === "/guru/jadwal" ? "fill-blue-100" : ""}`} />
          <span className="text-[9px] font-medium leading-none">Jadwal</span>
        </Link>
        
        {/* 3. Presensi (Tengah - Elevated Floating Button) */}
        <div className="flex flex-col items-center justify-center h-full relative">
          <Link
            href="/guru/absen"
            className="flex flex-col items-center justify-center w-full"
            aria-label="Menu Presensi Kehadiran"
          >
            <div
              className={`p-3 rounded-full absolute -top-5 border-4 border-slate-50 shadow-md transition-all active:scale-95 ${
                pathname === "/guru/absen"
                  ? "bg-emerald-600 text-white"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              }`}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <span
              className={`text-[9px] font-bold mt-7 leading-none ${
                pathname === "/guru/absen" ? "text-emerald-600" : "text-primary-600"
              }`}
            >
              Presensi
            </span>
          </Link>
        </div>

        {/* 4. Honor */}
        <Link
          href="/guru/honor"
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            pathname === "/guru/honor" ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
          }`}
        >
          <Wallet className={`w-5 h-5 mb-1 ${pathname === "/guru/honor" ? "fill-blue-100" : ""}`} />
          <span className="text-[9px] font-medium leading-none">Honor</span>
        </Link>

        {/* 5. Profil */}
        <Link
          href="/guru/profil"
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            pathname === "/guru/profil" ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
          }`}
        >
          <User className={`w-5 h-5 mb-1 ${pathname === "/guru/profil" ? "fill-blue-100" : ""}`} />
          <span className="text-[9px] font-medium leading-none">Profil</span>
        </Link>
      </div>
    </nav>
  );
}
