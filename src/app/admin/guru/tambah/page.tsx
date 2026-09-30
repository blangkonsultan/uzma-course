import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { GuruForm } from "@/components/admin/guru/guru-form";

export const metadata = {
  title: "Tambah Guru Baru | Uzma Course",
};

export default async function TambahGuruPage() {
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
        title="Tambah Guru Baru"
        description="Daftarkan akun pengajar baru, tetapkan cabang dan program bimbingan."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Guru", href: "/admin/guru" },
          { label: "Tambah Guru" },
        ]}
      />

      <GuruForm />
    </div>
  );
}
