import { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyStateMessage?: string;
  mobileCard?: (item: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyStateMessage = "Belum ada data yang tersedia",
  mobileCard,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <FolderOpen className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-700">{emptyStateMessage}</p>
        <p className="text-xs text-slate-400 mt-1">
          Gunakan filter yang berbeda atau tambahkan data baru.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card List (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {data.map((item) => {
          const key = keyExtractor(item);
          if (mobileCard) {
            return <div key={key}>{mobileCard(item)}</div>;
          }

          return (
            <div
              key={key}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5"
            >
              {columns.map((col, idx) => {
                if (col.hideOnMobile) return null;
                const value = col.cell
                  ? col.cell(item)
                  : col.accessorKey
                  ? String(item[col.accessorKey] ?? "")
                  : null;

                return (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                      {col.header}
                    </span>
                    <span className="text-right font-medium text-slate-800 break-words">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block overflow-hidden bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    scope="col"
                    className={`px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider ${
                      col.className || ""
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => {
                const key = keyExtractor(item);
                return (
                  <tr
                    key={key}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {columns.map((col, idx) => {
                      const value = col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? String(item[col.accessorKey] ?? "")
                        : null;

                      return (
                        <td
                          key={idx}
                          className={`px-5 py-4 text-slate-700 font-medium ${
                            col.className || ""
                          }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
