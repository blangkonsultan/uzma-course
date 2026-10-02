import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { ShiftForm } from "@/components/admin/shift/shift-form";
import { getBranches } from "@/lib/branches";

export const metadata: Metadata = {
  title: "Tambah Shift | Admin Uzma Course",
};

export default async function TambahShiftPage() {
  const branches = await getBranches();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Shift Baru"
        description="Buat slot waktu/sesi baru untuk master penjadwalan"
      />
      <ShiftForm branches={branches} />
    </div>
  );
}
