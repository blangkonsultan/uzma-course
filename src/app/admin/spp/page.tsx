import { requireAdminPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { getBillingSummary } from "@/lib/billing";
import { getBranches } from "@/lib/branches";
import { BillingClient } from "@/components/admin/billing/billing-client";
export const metadata = {
  title: "Tagihan SPP Murid | Uzma Course",
};

interface AdminBillingPageProps {
  searchParams: Promise<{
    branch?: string;
    status?: string;
    q?: string;
  }>;
}

export default async function AdminBillingPage({
  searchParams,
}: AdminBillingPageProps) {
  await requireAdminPage();
  const { branch, status, q } = await searchParams;

  const [summary, branches] = await Promise.all([
    getBillingSummary({
      branchId: branch,
      status: status,
      search: q,
    }),
    getBranches(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tagihan SPP Murid"
        description="Kelola tagihan SPP berkala per siklus 28 hari, catat penerimaan kas, dan terbitkan kwitansi resmi."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Tagihan SPP" },
        ]}
      />

      <BillingClient
        initialSummary={summary}
        branches={branches}
        currentBranch={branch || "all"}
        currentStatus={status || "all"}
        currentSearch={q || ""}
      />
    </div>
  );
}
