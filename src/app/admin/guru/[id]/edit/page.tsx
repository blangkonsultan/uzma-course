import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { GuruForm } from "@/components/admin/guru/guru-form";

export const metadata = {
  title: "Edit Data Guru | Uzma Course",
};

interface EditGuruPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGuruPage({ params }: EditGuruPageProps) {
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

  const { data: guru } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "guru")
    .single();

  if (!guru) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Data: ${guru.full_name}`}
        description="Perbarui informasi pengajar, kontak, cabang, dan status aktif akun."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Guru", href: "/admin/guru" },
          { label: `Edit ${guru.full_name}` },
        ]}
      />

      <GuruForm initialData={guru} isEdit />
    </div>
  );
}
