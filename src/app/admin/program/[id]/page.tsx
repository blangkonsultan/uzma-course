import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgramStatusButton } from "@/components/admin/program/program-status-button";
import { getProgramById } from "@/lib/programs";
import {
  BookOpen,
  ArrowLeft,
  Edit2,
  Users,
  GraduationCap,
  Award,
  Clock, Calendar,
  Wallet,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { formatClassRatio, formatDuration, formatFrequencyShort } from "@/lib/utils";

export const metadata = {
  title: "Detail Program Belajar | Uzma Course",
};

interface ProgramDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
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

  const [program, studentCountRes, teacherCountRes] = await Promise.all([
    getProgramById(id),
    supabase
      .from("student_programs")
      .select("*", { count: "exact", head: true })
      .eq("program_id", id),
    supabase
      .from("profile_programs")
      .select("*", { count: "exact", head: true })
      .eq("program_id", id),
  ]);

  if (!program) {
    notFound();
  }

  const studentCount = studentCountRes.count ?? 0;
  const teacherCount = teacherCountRes.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          href="/admin/program"
          className="gap-1.5 text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Master Program</span>
        </Button>
      </div>

      <PageHeader
        title={program.name}
        description={program.tagline || "Program bimbingan belajar Uzma Course."}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge isActive={program.is_active} />
            <Button
              variant="outline"
              size="sm"
              href={`/admin/program/${program.id}/edit`}
              className="gap-1.5 h-9"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Program</span>
            </Button>
            <ProgramStatusButton
              programId={program.id}
              programName={program.name}
              isActive={program.is_active}
              showLabel
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold border transition-colors shadow-2xs ${
                program.is_active
                  ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            />
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Murid Terdaftar
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1 font-heading">
              {studentCount}
            </p>
            <p className="text-xs text-slate-500 mt-2">Total murid aktif & arsip</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Guru Pengampu
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-1 font-heading">
              {teacherCount}
            </p>
            <p className="text-xs text-slate-500 mt-2">Tenaga pengajar yang ditugaskan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kategori
            </p>
            <p className="text-xl font-bold text-slate-900 mt-2 font-heading">
              {program.type === "franchise" ? "Franchise Resmi" : "Original Uzma"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {program.license_provider || "Internal Uzma Course"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Inisial & Ikon
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary-100 text-primary-700 border border-primary-200">
                {program.initials}
              </span>
              <span className="text-xs text-slate-600 font-mono">
                {program.icon}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Urutan tampil: #{program.sort_order}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Informasi & Kurikulum */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Deskripsi & Metode Belajar
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono truncate max-w-full">
                ID: {program.id}
              </span>
            </CardHeader>

            <CardBody className="p-4 sm:p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Tagline
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {program.tagline || "-"}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Deskripsi Lengkap
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {program.description || "Belum ada deskripsi untuk program ini."}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Fasilitas & Fitur Program
                </span>
                {program.features && program.features.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {program.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Belum ada fasilitas khusus yang dicantumkan.
                  </p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Franchise Details (if applicable) */}
          {program.type === "franchise" && (
            <Card className="border border-primary-200 shadow-xs overflow-hidden bg-primary-50/20">
              <CardHeader className="bg-primary-100/50 border-b border-primary-200/60 p-4 sm:p-5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-200 text-primary-800 flex items-center justify-center font-bold text-sm shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-primary-950">
                  Informasi Lisensi Franchise
                </h2>
              </CardHeader>

              <CardBody className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Pemberi Lisensi (Licensor)
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {program.license_provider || "-"}
                    </p>
                  </div>

                  {program.license_url && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Situs Resmi Licensor
                      </span>
                      <a
                        href={program.license_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 break-all max-w-full"
                      >
                        <span className="break-all">{program.license_url}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {program.license_description && (
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Keterangan Lisensi
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {program.license_description}
                    </p>
                  </div>
                )}

                {program.logo_url && (
                  <div className="pt-2 border-t border-primary-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Logo Resmi
                    </span>
                    <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={program.logo_url}
                        alt={`Logo ${program.name}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column: Operasional & Teknis */}
        <div className="space-y-6">
          <Card className="border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4 sm:p-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Sistem & Jadwal Belajar
              </h2>
            </CardHeader>

            <CardBody className="p-4 sm:p-6 space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Varian Tersedia
                </span>
                {program.program_variants && program.program_variants.length > 0 ? (
                  <div className="space-y-2">
                    {program.program_variants.map((v) => (
                      <div key={v.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <p className="text-sm font-semibold text-slate-800">{v.name}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDuration(v.duration)}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatFrequencyShort(v.frequency || 3)}</span>
                          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {formatClassRatio(v.system)}</span>
                          <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Rp {v.teacher_fee.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Belum ada varian program.</p>
                )}
              </div>



              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Target Usia
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {program.age_range || "-"}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
