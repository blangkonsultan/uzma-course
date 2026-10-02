import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { BranchStatusButton } from "@/components/admin/cabang/branch-status-button";
import { BranchShiftManager } from "@/components/admin/cabang/branch-shift-manager";
import { getBranchById } from "@/lib/branches";
import {
  Building2,
  ArrowLeft,
  Edit2,
  Users,
  GraduationCap,
  MapPin,
  ExternalLink,
  Calendar,
} from "lucide-react";

export const metadata = {
  title: "Detail Cabang | Uzma Course",
};

interface BranchDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BranchDetailPage({ params }: BranchDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin");
  }

  
  const { data: shifts = [] } = await supabase
    .from("branch_shifts")
    .select("*")
    .eq("branch_id", id)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  const [branch, guruCountRes, studentCountRes] = await Promise.all([
    getBranchById(id),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "guru")
      .eq("branch_id", id)
      .eq("is_active", true),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("branch_id", id)
      .eq("is_active", true),
  ]);

  if (!branch) {
    notFound();
  }

  const guruCount = guruCountRes.count ?? 0;
  const studentCount = studentCountRes.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          href="/admin/cabang"
          className="gap-1.5 text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data Cabang</span>
        </Button>
      </div>

      <PageHeader
        title={branch.name}
        description={branch.sub_name || "Cabang bimbingan belajar Uzma Course."}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge isActive={branch.is_active} />
            <Button
              variant="outline"
              size="sm"
              href={`/admin/cabang/${branch.id}/edit`}
              className="gap-1.5 h-9"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Cabang</span>
            </Button>
            <BranchStatusButton
              branchId={branch.id}
              branchName={branch.name}
              isActive={branch.is_active}
              showLabel
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold border transition-colors shadow-2xs ${
                branch.is_active
                  ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            />
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Guru Aktif
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1 font-heading">
              {guruCount}
            </p>
            <p className="text-xs text-slate-400 mt-2">Tenaga pengajar aktif di cabang ini</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Murid Aktif
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1 font-heading">
              {studentCount}
            </p>
            <p className="text-xs text-slate-400 mt-2">Siswa aktif belajar di cabang ini</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Operasional
            </p>
            <p className="text-xl font-bold text-slate-900 mt-2 font-heading">
              {branch.is_active ? "Aktif Beroperasi" : "Non-aktif"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {branch.is_active ? "Menerima pendaftaran & penempatan" : "Tidak aktif sementara"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Informasi Cabang */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Informasi Cabang
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                ID: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">{branch.id}</code>
              </span>
            </CardHeader>

            <CardBody className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Nama Cabang
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {branch.name}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Sub-Nama / Unit Sentra
                  </span>
                  <p className="text-sm text-slate-700">
                    {branch.sub_name || "-"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Alamat Lengkap
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {branch.address || "-"}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5 text-xs text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-700">Tanggal Dibuat</span>
                    <span>
                      {new Date(branch.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-700">Terakhir Diperbarui</span>
                    <span>
                      {new Date(branch.updated_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column (1 col): Lokasi & Peta */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4 sm:p-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Lokasi & Peta
              </h2>
            </CardHeader>

            <CardBody className="p-4 sm:p-6 space-y-4">
              {branch.map_embed_url ? (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                    <iframe
                      src={branch.map_embed_url}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Peta Lokasi ${branch.name}`}
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Peta lokasi bimbingan belajar
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                  <p className="text-xs text-slate-500">
                    Belum ada embed peta Google Maps untuk cabang ini.
                  </p>
                </div>
              )}

              {branch.gmaps_url ? (
                <a
                  href={branch.gmaps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors min-h-[44px]"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Buka di Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              ) : (
                <p className="text-xs text-slate-400 italic text-center">
                  Link navigasi Google Maps belum ditambahkan.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
      {/* Shift Manager */}
      <div className="mt-8">
        <BranchShiftManager branchId={branch.id} shifts={shifts || []} />
      </div>

    </div>
  );
}
