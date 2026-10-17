import { requireAdminPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { getBillingSummary } from "@/lib/billing";
import { BillingClient } from "@/components/admin/billing/billing-client";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const [summary, branchesRes] = await Promise.all([
    getBillingSummary({
      branchId: branch,
      status: status,
      search: q,
    }),
    supabase
      .from("branches")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
  ]);

  const branches = branchesRes.data || [];

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
