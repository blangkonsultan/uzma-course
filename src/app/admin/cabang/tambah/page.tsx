import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { BranchForm } from "@/components/admin/cabang/branch-form";

export const metadata = {
  title: "Tambah Cabang Baru | Uzma Course",
};

export default async function TambahCabangPage() {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Cabang Baru"
        description="Daftarkan cabang atau lokasi bimbingan belajar baru Uzma Course."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Cabang", href: "/admin/cabang" },
          { label: "Tambah Cabang" },
        ]}
      />

      <BranchForm />
    </div>
  );
}
