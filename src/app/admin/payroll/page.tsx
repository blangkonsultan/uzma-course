import { requireAdminPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import {
  getPayrollPeriodForAdmin,
  getOpenPayrollPeriod,
  createPayrollPeriod,
} from "@/lib/payroll";
import { PayrollPeriodClient } from "@/components/admin/payroll/payroll-period-client";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Penggajian Guru | Uzma Course",
};

interface AdminPayrollPageProps {
  searchParams: Promise<{
    period?: string;
  }>;
}

function getCurrentMonthFirstDay(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export default async function AdminPayrollPage({
  searchParams,
}: AdminPayrollPageProps) {
  const { user } = await requireAdminPage();
  const { period: requestedPeriodId } = await searchParams;

  const currentMonthDate = getCurrentMonthFirstDay();
  let targetPeriodId = requestedPeriodId;

  if (!targetPeriodId) {
    const openPeriod = await getOpenPayrollPeriod(currentMonthDate);
    if (openPeriod) {
      targetPeriodId = openPeriod.id;
    } else {
      // Check most recent period
      const supabase = await createClient();
      const { data: recent } = await supabase
        .from("payroll_periods")
        .select("id")
        .order("period_month", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recent) {
        targetPeriodId = recent.id;
      } else {
        // Automatically create open period for current month
        const newPeriod = await createPayrollPeriod(user.id, currentMonthDate);
        targetPeriodId = newPeriod.id;
      }
    }
  }

  const detail = targetPeriodId
    ? await getPayrollPeriodForAdmin(targetPeriodId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penggajian Guru"
        description="Kelola periode payroll bulanan, rekap fee sesi mengajar, tunjangan tetap, dan adjustment."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Penggajian Guru" },
        ]}
      />

      {detail ? (
        <PayrollPeriodClient initialDetail={detail} />
      ) : (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          Tidak ada data periode payroll yang ditemukan.
        </div>
      )}
    </div>
  );
}
