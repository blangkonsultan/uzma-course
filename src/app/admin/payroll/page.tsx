import { requireAdminPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import {
  getPayrollPeriodForAdmin,
  getOpenPayrollPeriod,
  createPayrollPeriod,
  getLatestPayrollPeriodId,
  getPayrollPeriods,
  getWIBMonthFirstDay,
} from "@/lib/payroll";
import { PayrollPeriodClient } from "@/components/admin/payroll/payroll-period-client";

export const metadata = {
  title: "Penggajian Guru | Uzma Course",
};

interface AdminPayrollPageProps {
  searchParams: Promise<{
    period?: string;
  }>;
}


export default async function AdminPayrollPage({
  searchParams,
}: AdminPayrollPageProps) {
  const { user } = await requireAdminPage();
  const { period: requestedPeriodId } = await searchParams;

  const currentMonthDate = getWIBMonthFirstDay();
  let targetPeriodId = requestedPeriodId;

  if (!targetPeriodId) {
    const openPeriod = await getOpenPayrollPeriod(currentMonthDate);
    if (openPeriod) {
      targetPeriodId = openPeriod.id;
    } else {
      const latestId = await getLatestPayrollPeriodId();
      if (latestId) {
        targetPeriodId = latestId;
      } else {
        // Automatically create open period for current month
        const newPeriod = await createPayrollPeriod(user.id, currentMonthDate);
        targetPeriodId = newPeriod.id;
      }
    }
  }

  const [detail, allPeriods] = await Promise.all([
    targetPeriodId ? getPayrollPeriodForAdmin(targetPeriodId) : null,
    getPayrollPeriods(),
  ]);
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
        <PayrollPeriodClient initialDetail={detail} allPeriods={allPeriods} />
      ) : (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          Tidak ada data periode payroll yang ditemukan.
        </div>
      )}
    </div>
  );
}
