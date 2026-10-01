import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StudentForm } from "@/components/admin/murid/student-form";
import { getPrograms } from "@/lib/programs";
import { getBranches } from "@/lib/branches";

export const metadata = {
  title: "Tambah Murid Baru | Uzma Course",
};

export default async function TambahMuridPage() {
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
    redirect("/admin/murid");
  }

  const [programs, branches] = await Promise.all([
    getPrograms(),
    getBranches(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Murid Baru"
        description="Formulir pendaftaran murid baru bimbingan belajar Uzma Course."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Murid", href: "/admin/murid" },
          { label: "Tambah Murid" },
        ]}
      />

      <StudentForm programs={programs} branches={branches} />
    </div>
  );
}
