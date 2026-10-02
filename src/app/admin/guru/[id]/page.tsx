import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { GuruStatusButton } from "@/components/admin/guru/guru-status-button";
import {
  User,
  ArrowLeft,
  Edit2,
  Mail,
  Phone,
  Building2,
  BookOpen,
  
  Wallet,
  
} from "lucide-react";
import { getBranches } from "@/lib/branches";
import { getPrograms } from "@/lib/programs";

export const metadata = {
  title: "Detail Guru | Uzma Course",
};

interface GuruDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GuruDetailPage({ params }: GuruDetailPageProps) {
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
    redirect("/admin/guru");
  }

  const { data: guru } = await supabase
    .from("profiles")
    .select("*, profile_programs(program_id)")
    .eq("id", id)
    .eq("role", "guru")
    .single();

  if (!guru) {
    notFound();
  }

  const [branches, programs] = await Promise.all([
    getBranches(),
    getPrograms(),
  ]);

  const assignedBranch = branches.find((b) => b.id === guru.branch_id);
  const assignedPrograms = guru.profile_programs
    ? programs.filter((p) =>
        guru.profile_programs.some((pp) => pp.program_id === p.id)
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          
          className="shrink-0 rounded-xl"
          
        >
          <Link href="/admin/guru" aria-label="Kembali ke Daftar Guru">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <PageHeader
          title={guru.full_name}
          description="Profil detail dan penugasan guru."
          breadcrumbs={[
            { label: "Dashboard", href: "/admin" },
            { label: "Data Guru", href: "/admin/guru" },
            { label: "Detail Guru" },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge isActive={guru.is_active} />
        <Button
          variant="outline"
          className="rounded-xl shadow-xs"
          
        >
          <Link href={`/admin/guru/${guru.id}/edit`}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Guru
          </Link>
        </Button>
        <GuruStatusButton
          guruId={guru.id}
          guruName={guru.full_name}
          isActive={guru.is_active}
          showLabel
          className="rounded-xl shadow-xs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-4 sm:p-6">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-500" />
                Informasi Personal
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-6 gap-2 sm:gap-4">
                  <div className="text-sm font-medium text-slate-500">Nama Lengkap</div>
                  <div className="text-sm font-semibold text-slate-900 sm:col-span-2">
                    {guru.full_name}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-6 gap-2 sm:gap-4">
                  <div className="text-sm font-medium text-slate-500">Email</div>
                  <div className="text-sm text-slate-900 sm:col-span-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    {guru.full_name || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-6 gap-2 sm:gap-4">
                  <div className="text-sm font-medium text-slate-500">No. WhatsApp</div>
                  <div className="text-sm text-slate-900 sm:col-span-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    {guru.phone || "-"}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-6 gap-2 sm:gap-4 bg-slate-50/50">
                  <div className="text-sm font-medium text-slate-500">Cabang Penugasan</div>
                  <div className="text-sm font-semibold text-slate-900 sm:col-span-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary-500" />
                    {assignedBranch ? assignedBranch.name : "-"}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-4 sm:p-6">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-slate-500" />
                Informasi Kompensasi & Bank
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-6 gap-2 sm:gap-4">
                  <div className="text-sm font-medium text-slate-500">Rekening Bank</div>
                  <div className="text-sm text-slate-900 sm:col-span-2">
                    {guru.bank_name ? (
                      <div>
                        <span className="font-semibold">{guru.bank_name}</span> - {guru.bank_account_number}
                        <br />
                        <span className="text-slate-500 text-xs">a.n. {guru.bank_account_holder}</span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-6 gap-2 sm:gap-4">
                  <div className="text-sm font-medium text-slate-500">Tunjangan Bulanan</div>
                  <div className="text-sm text-slate-900 sm:col-span-2 space-y-1">
                    {(guru.allowances as {name: string, amount: number}[])?.length > 0 ? (
                      (guru.allowances as {name: string, amount: number}[]).map((a, idx) => (
                        <div key={idx} className="flex justify-between max-w-xs">
                          <span className="text-slate-500">{a.name}:</span>
                          <span className="font-semibold">Rp {(a.amount || 0).toLocaleString('id-ID')}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Tidak ada tunjangan khusus</span>
                    )}
                  </div>
                </div>
                {guru.minimum_income != null && guru.minimum_income > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-6 gap-2 sm:gap-4 bg-slate-50/50">
                    <div className="text-sm font-medium text-slate-500">Pendapatan Minimal</div>
                    <div className="text-sm font-semibold text-slate-900 sm:col-span-2">
                      Rp {guru.minimum_income.toLocaleString('id-ID')}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="border-b border-slate-100 p-4 sm:p-6">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-500" />
                Program yang Diampu
              </h2>
            </CardHeader>
            <CardBody className="p-4 sm:p-6">
              {assignedPrograms.length > 0 ? (
                <ul className="space-y-3">
                  {assignedPrograms.map((p) => (
                    <li key={p.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          [{p.initials}] {p.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.type === "franchise" ? "Franchise" : "Original"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada program yang diampu.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
