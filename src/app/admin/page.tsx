import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  ArrowRight,
  Plus,
  Sparkles,
} from "lucide-react";
import { PROGRAMS } from "@/lib/constants";

export const metadata = {
  title: "Dashboard Overview | Uzma Course",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const userBranch = profile?.branch_id;

  // Parallel data fetching for optimal performance
  const [
    guruCountRes,
    allStudentsRes,
  ] = await Promise.all([
    // Active teachers count
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "guru")
      .eq("is_active", true),

    // All active students with their branch & programs
    supabase
      .from("students")
      .select("id, branch_id, programs")
      .eq("is_active", true),
  ]);

  const activeGuruCount = guruCountRes.count ?? 0;
  const activeStudents = allStudentsRes.data ?? [];

  // Filter students if current user is guru with specific branch
  const relevantStudents =
    !isAdmin && userBranch
      ? activeStudents.filter((s) => s.branch_id === userBranch)
      : activeStudents;

  const totalMuridCount = relevantStudents.length;

  const balongbendoMuridCount = activeStudents.filter(
    (s) => s.branch_id === "balongbendo"
  ).length;

  const krianMuridCount = activeStudents.filter(
    (s) => s.branch_id === "krian"
  ).length;

  // Program counts
  const programCounts = PROGRAMS.map((prog) => {
    const count = relevantStudents.filter((s) =>
      s.programs?.includes(prog.id)
    ).length;
    return {
      id: prog.id,
      initials: prog.initials,
      name: prog.name,
      count,
    };
  });

  const greetingName = profile?.full_name || user.email?.split("@")[0] || "Rekan";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-primary-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-medium backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isAdmin ? "Administrator Portal" : "Portal Pengajar Guru"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Halo, {greetingName}! 👋
            </h1>
            <p className="text-primary-100 text-sm max-w-xl">
              Selamat datang di sistem manajemen operasional Uzma Course. Pantau
              dan kelola data guru dan murid dengan mudah.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                href="/admin/guru/tambah"
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Guru
              </Button>
            )}
            {isAdmin && (
              <Button
                size="sm"
                href="/admin/murid/tambah"
                className="bg-white text-primary-800 hover:bg-slate-100 text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Murid
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Guru Card (visible to all, admin clicks to /admin/guru) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Guru Aktif
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1 font-heading">
              {activeGuruCount}
            </p>
            {isAdmin ? (
              <Link
                href="/admin/guru"
                className="text-xs text-primary-600 font-semibold hover:text-primary-700 mt-2 inline-flex items-center gap-1"
              >
                <span>Kelola Guru</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <p className="text-xs text-slate-400 mt-2">Terdaftar di sistem</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Murid Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Murid Aktif {userBranch && !isAdmin ? `(${userBranch})` : ""}
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1 font-heading">
              {totalMuridCount}
            </p>
            <Link
              href="/admin/murid"
              className="text-xs text-primary-600 font-semibold hover:text-primary-700 mt-2 inline-flex items-center gap-1"
            >
              <span>Lihat Semua Murid</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Cabang Balongbendo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cabang Balongbendo
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1 font-heading">
              {balongbendoMuridCount}
            </p>
            <p className="text-xs text-slate-400 mt-2">Murid aktif terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Cabang Krian */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cabang Krian
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1 font-heading">
              {krianMuridCount}
            </p>
            <p className="text-xs text-slate-400 mt-2">Murid aktif terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Program Distribution Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Distribusi Murid per Program
              </h2>
              <p className="text-xs text-slate-500">
                Jumlah peserta aktif pada setiap bidang bimbingan belajar
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {programCounts.map((prog) => (
            <div
              key={prog.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                    {prog.initials}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Program
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800 leading-snug">
                  {prog.name}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Total Murid</span>
                <span className="text-xl font-extrabold text-slate-900 font-heading">
                  {prog.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
