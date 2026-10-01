import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ProgramForm } from "@/components/admin/program/program-form";

export const metadata = {
  title: "Tambah Program Belajar | Uzma Course",
};

export default async function TambahProgramPage() {
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
    redirect("/admin/program");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Program Baru"
        description="Daftarkan program bimbingan belajar baru ke dalam sistem master data."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Master Program", href: "/admin/program" },
          { label: "Tambah Program" },
        ]}
      />

      <ProgramForm />
    </div>
  );
}
