import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { StudentStatusButton } from "@/components/admin/murid/student-status-button";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  FileText,
  Edit2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { PROGRAMS, BRANCHES, getProgramInitials } from "@/lib/constants";

export const metadata = {
  title: "Detail Murid | Uzma Course",
};

interface StudentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailPage({
  params,
}: StudentDetailPageProps) {
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
    .select("role, branch_id")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const guruBranch = profile?.branch_id;

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (!student) {
    notFound();
  }

  // If guru is restricted to a branch, verify matching branch
  if (!isAdmin && guruBranch && student.branch_id !== guruBranch) {
    redirect("/admin/murid");
  }

  const branchObj = BRANCHES.find((b) => b.id === student.branch_id);

  // Calculate age from birth_date
  let ageDisplay: string | null = null;
  if (student.birth_date) {
    const birth = new Date(student.birth_date);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      years--;
    }
    ageDisplay = `${years} tahun`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.full_name}
        description={`Terdaftar sejak ${new Date(
          student.created_at
        ).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Murid", href: "/admin/murid" },
          { label: student.full_name },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              href="/admin/murid"
              className="text-slate-600 hover:text-slate-900 border border-slate-200 bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Daftar Murid</span>
            </Button>

            {isAdmin && (
              <>
                <Button
                  size="sm"
                  href={`/admin/murid/${student.id}/edit`}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Data</span>
                </Button>
                <div className="bg-white border border-slate-200 rounded-full p-1 shadow-2xs">
                  <StudentStatusButton
                    studentId={student.id}
                    studentName={student.full_name}
                    isActive={student.is_active}
                  />
                </div>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Diri Murid (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Profile Card */}
          <Card className="border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Data Pribadi Murid
                </h2>
              </div>
              <StatusBadge isActive={student.is_active} />
            </CardHeader>

            <CardBody className="p-6 divide-y divide-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Nama Lengkap
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {student.full_name}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Tanggal Lahir / Usia
                  </span>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {student.birth_date
                        ? `${new Date(student.birth_date).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "long", year: "numeric" }
                          )} ${ageDisplay ? `(${ageDisplay})` : ""}`
                        : "Tidak dicantumkan"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="py-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Alamat Tempat Tinggal
                </span>
                <p className="text-sm text-slate-700 leading-relaxed flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {student.address || "Alamat belum dilengkapi."}
                  </span>
                </p>
              </div>

              <div className="pt-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Catatan Khusus / Perkembangan
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p>
                    {student.notes ||
                      "Belum ada catatan khusus mengenai perkembangan murid ini."}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Programs Enrolled Card */}
          <Card className="border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Program Bimbingan Belajar yang Diikuti
              </h2>
            </CardHeader>

            <CardBody className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {student.programs.map((progId) => {
                  const progObj = PROGRAMS.find((p) => p.id === progId);
                  return (
                    <div
                      key={progId}
                      className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-primary-300 transition-colors shadow-2xs"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                          {getProgramInitials(progId)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          Program Terdaftar
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {progObj ? progObj.name : progId}
                      </p>
                      {progObj && (
                        <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                          <p>• {progObj.system}</p>
                          <p>• {progObj.duration} ({progObj.frequency})</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Orang Tua & Cabang */}
        <div className="space-y-6">
          {/* Orang Tua Card */}
          <Card className="border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                <Phone className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Kontak Orang Tua / Wali
              </h2>
            </CardHeader>

            <CardBody className="p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Nama Orang Tua / Wali
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {student.parent_name}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Nomor WhatsApp
                </span>
                <a
                  href={`https://wa.me/${student.parent_phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 transition-colors w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{student.parent_phone}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                </a>
              </div>

              {student.parent_email && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Email Orang Tua
                  </span>
                  <p className="text-xs font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{student.parent_email}</span>
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Cabang Card */}
          <Card className="border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Lokasi Cabang
              </h2>
            </CardHeader>

            <CardBody className="p-6 space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Cabang Penugasan
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {branchObj ? branchObj.name : student.branch_id}
                </p>
                {branchObj && (
                  <p className="text-xs text-primary-600 font-medium mt-0.5">
                    {branchObj.subName}
                  </p>
                )}
              </div>

              {branchObj && (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <p>{branchObj.address}</p>
                  <a
                    href={branchObj.gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold mt-2"
                  >
                    <span>Buka Petunjuk Arah Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
