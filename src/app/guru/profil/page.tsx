import { requireGuruPage } from "@/lib/auth";
import { User, LogOut, KeyRound, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ProfilPage() {
  const { profile, user } = await requireGuruPage();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
      
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <User className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{profile?.full_name || "Guru"}</h2>
          <p className="text-slate-500 text-sm mt-1">{user?.email || "guru@example.com"}</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
          Guru
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <Link href="/guru/profil/password" className="p-4 flex items-center justify-between border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors w-full">
          <div className="flex items-center space-x-3 text-slate-700">
            <KeyRound className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Ganti Kata Sandi</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </Link>
        <a href="/logout" className="p-4 flex items-center justify-between text-red-600 hover:bg-red-50 transition-colors">
          <div className="flex items-center space-x-3">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
          </div>
        </a>
      </div>
    </div>
  );
}
