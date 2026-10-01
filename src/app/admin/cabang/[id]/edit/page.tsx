import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { BranchForm } from "@/components/admin/cabang/branch-form";
import { getBranchById } from "@/lib/branches";

export const metadata = {
  title: "Edit Cabang | Uzma Course",
};

interface EditBranchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBranchPage({ params }: EditBranchPageProps) {
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
    redirect("/admin/cabang");
  }

  const branch = await getBranchById(id);

  if (!branch) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Cabang: ${branch.name}`}
        description="Perbarui informasi cabang, unit sentra, alamat, dan link peta Google Maps."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Data Cabang", href: "/admin/cabang" },
          { label: branch.name, href: `/admin/cabang/${branch.id}` },
          { label: "Edit" },
        ]}
      />

      <BranchForm initialData={branch} isEdit />
    </div>
  );
}
