import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { DraftForm } from "@/components/admin/draft/draft-form";
import { getBranches } from "@/lib/branches";
import { requireAdminPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Buat Draf Jadwal | Admin Uzma Course",
};

export default async function TambahDraftPage() {
  await requireAdminPage();
  const branches = await getBranches();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Draf Jadwal Baru"
        description="Buat versi (draf) jadwal baru untuk dikonfigurasi di Papan Kanban"
      />
      <DraftForm branches={branches} />
    </div>
  );
}
