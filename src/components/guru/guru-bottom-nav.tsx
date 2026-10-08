"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, User } from "lucide-react";

export function GuruBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
      <div className="flex justify-around items-center max-w-md mx-auto h-16 relative px-2">
        <Link
          href="/guru"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            pathname === "/guru" ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
          }`}
        >
          <Home className={`w-6 h-6 mb-1 ${pathname === "/guru" ? "fill-blue-100" : ""}`} />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        
        <Link
          href="/guru/absen"
          className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 transition-colors"
        >
          <div className={`p-3 rounded-full absolute -top-5 border-4 border-slate-50 shadow-md transition-colors ${
            pathname === "/guru/absen" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
          }`}>
            <MapPin className="w-6 h-6" />
          </div>
          <span className={`text-[10px] font-bold mt-7 ${
            pathname === "/guru/absen" ? "text-emerald-600" : "text-blue-600"
          }`}>Absen</span>
        </Link>

        <Link
          href="/guru/profil"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            pathname === "/guru/profil" ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
          }`}
        >
          <User className={`w-6 h-6 mb-1 ${pathname === "/guru/profil" ? "fill-blue-100" : ""}`} />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </div>
    </nav>
  );
}
