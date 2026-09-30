"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { Search, X, Filter } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
}

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
}

export function SearchFilterBar({
  searchPlaceholder = "Cari...",
  filters = [],
}: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const [prevSearch, setPrevSearch] = useState(currentSearch);
  const [searchValue, setSearchValue] = useState(currentSearch);

  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch);
    setSearchValue(currentSearch);
  }

  function updateQuery(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset pagination to 1 whenever search or filters change
    params.delete("page");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ search: searchValue });
  }

  function handleClearSearch() {
    setSearchValue("");
    updateQuery({ search: null });
  }

  const hasActiveFilters =
    Boolean(searchParams.get("search")) ||
    filters.some((f) => Boolean(searchParams.get(f.id)));

  function handleResetAll() {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Filter Dropdowns */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => {
              const currentValue = searchParams.get(filter.id) || "all";
              return (
                <div key={filter.id} className="relative min-w-[130px]">
                  <select
                    value={currentValue}
                    onChange={(e) =>
                      updateQuery({ [filter.id]: e.target.value })
                    }
                    className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors cursor-pointer"
                  >
                    <option value="all">Semua {filter.label}</option>
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAll}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      {isPending && (
        <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-primary-500 animate-indeterminate" />
        </div>
      )}
    </div>
  );
}
