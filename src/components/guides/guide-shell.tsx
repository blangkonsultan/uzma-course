"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import { filterGuideIndex } from "@/lib/guides/navigation";
import { cn } from "@/lib/utils";
import type { GuideIndexItem, GuideRole } from "@/types/guides";

export interface GuideShellProps {
  role: GuideRole;
  basePath: "/admin/panduan" | "/guru/panduan";
  index: readonly GuideIndexItem[];
  activeSlug: string;
  children: ReactNode;
}

export function GuideShell({ role, basePath, index, activeSlug, children }: GuideShellProps): ReactElement {
  const [query, setQuery] = useState("");
  const [openForTopic, setOpenForTopic] = useState<string | null>(null);
  const previousTopic = useRef(activeSlug);
  const contentsId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => filterGuideIndex(index, query), [index, query]);
  const contentsOpen = openForTopic === activeSlug;

  // An open contents panel belongs to its current topic, including Back/Forward navigation.
  if (openForTopic !== null && openForTopic !== activeSlug) setOpenForTopic(null);

  useEffect(() => {
    if (previousTopic.current !== activeSlug) {
      previousTopic.current = activeSlug;
      document.getElementById("guide-article")?.focus({ preventScroll: true });
    }
  }, [activeSlug]);

  function closeContents() {
    setOpenForTopic(null);
  }

  function clearSearch() {
    setQuery("");
    searchRef.current?.focus();
  }

  return (
    <div
      data-guide-print-container
      className={cn("min-w-0 rounded-2xl border border-slate-200 bg-white", role === "admin" && "lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]")}
    >
      <aside
        data-guide-screen-only
        className={cn("min-w-0 border-b border-slate-200", role === "admin" && "lg:border-r lg:border-b-0")}
      >
        <button
          type="button"
          aria-expanded={contentsOpen}
          aria-controls={contentsId}
          onClick={() => setOpenForTopic(contentsOpen ? null : activeSlug)}
          className={cn("flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600", role === "admin" && "lg:hidden")}
        >
          Daftar isi panduan
          <ChevronDown aria-hidden="true" className={cn("h-4 w-4 shrink-0", contentsOpen && "rotate-180")} />
        </button>
        <div id={contentsId} className={cn(contentsOpen ? "block" : "hidden", role === "admin" && "lg:block")}>
          <div className="space-y-5 p-4 lg:sticky lg:top-20">
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-slate-500" />
              <input
                ref={searchRef}
                type="search"
                aria-label="Cari topik panduan"
                placeholder="Cari topik panduan"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white py-2.5 pr-11 pl-9 text-base text-slate-800 caret-primary-700 placeholder:text-slate-500 focus:border-primary-600 focus:outline-2 focus:outline-offset-1 focus:outline-primary-600 sm:text-sm"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={clearSearch}
                  className="absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-primary-600"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <nav aria-label={`Topik panduan ${role === "admin" ? "admin" : "guru"}`}>
              {filtered.length ? (
                <ul className="space-y-1">
                  {filtered.map((item, position) => (
                    <li key={item.slug}>
                      {position === 0 || filtered[position - 1].chapterTitle !== item.chapterTitle ? (
                        <h2 className={cn("px-2 pb-2 text-xs font-semibold text-slate-600", position > 0 && "pt-5")}>
                          {item.chapterTitle}
                        </h2>
                      ) : null}
                      <Link
                        href={`${basePath}?topik=${encodeURIComponent(item.slug)}#guide-article`}
                        prefetch={false}
                        aria-current={item.slug === activeSlug ? "page" : undefined}
                        onNavigate={closeContents}
                        className={cn("flex min-h-11 items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-600", item.slug === activeSlug ? "bg-primary-100 font-semibold text-primary-900" : "text-slate-700 hover:bg-slate-50 hover:text-primary-800")}
                      >
                        <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                        <span className="min-w-0 break-words">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p role="status" className="px-2 py-3 text-sm leading-relaxed text-slate-600">
                  Topik tidak ditemukan. Hapus pencarian atau gunakan kata lain.
                </p>
              )}
            </nav>
          </div>
        </div>
      </aside>
      <div data-guide-print-container className="min-w-0 p-4 sm:p-6">{children}</div>
    </div>
  );
}
