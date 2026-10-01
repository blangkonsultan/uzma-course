import { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface MasterMobileCardProps {
  /** Initials (1-3 chars) and avatar color scheme */
  avatar: {
    initials: string;
    color?: "purple" | "blue" | "emerald" | "amber" | "slate";
  };
  /** Primary title / name of the entity */
  title: string;
  /** Link for the title (e.g. detail or edit page) */
  titleHref?: string;
  /** Subtitle line under the title (e.g. email, parent name, tagline) */
  subtitle?: ReactNode;
  /** Right-aligned status badge element */
  status?: ReactNode;
  /** Row of pills / tags below the header */
  badges?: ReactNode;
  /** Two-column summary key-value box */
  specs?: {
    left: {
      label: string;
      value: ReactNode;
    };
    right: {
      label: string;
      value: ReactNode;
    };
  };
  /** Bottom action buttons bar */
  actions: ReactNode;
  className?: string;
}

const AVATAR_COLOR_MAP = {
  purple: "bg-purple-100 text-purple-700",
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  slate: "bg-slate-100 text-slate-700",
};

/**
 * Standardized Master Mobile Card component.
 * Used across all admin master entities (Program, Guru, Murid, and any future master)
 * to guarantee 100% visual and structural consistency on mobile screens.
 */
export function MasterMobileCard({
  avatar,
  title,
  titleHref,
  subtitle,
  status,
  badges,
  specs,
  actions,
  className,
}: MasterMobileCardProps) {
  const avatarClass =
    AVATAR_COLOR_MAP[avatar.color || "purple"] || AVATAR_COLOR_MAP.purple;

  return (
    <div
      className={cn(
        "bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3",
        className
      )}
    >
      {/* 1. Header: Avatar + Identity + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-10 h-10 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs",
              avatarClass
            )}
          >
            {avatar.initials}
          </div>
          <div className="min-w-0">
            {titleHref ? (
              <Link
                href={titleHref}
                className="font-semibold text-slate-900 hover:text-primary-600 transition-colors text-sm leading-tight block truncate"
              >
                {title}
              </Link>
            ) : (
              <span className="font-semibold text-slate-900 text-sm leading-tight block truncate">
                {title}
              </span>
            )}
            {subtitle && (
              <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {status && <div className="shrink-0">{status}</div>}
      </div>

      {/* 2. Pills / Badges Row */}
      {badges && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {badges}
        </div>
      )}

      {/* 3. Summary Specs Box (Two-column Key-Value summary box) */}
      {specs && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
              {specs.left.label}
            </span>
            <div className="mt-1 font-semibold text-slate-800 break-words">
              {specs.left.value}
            </div>
          </div>
          <div className="text-right min-w-0">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
              {specs.right.label}
            </span>
            <div className="mt-1 font-semibold text-slate-800 break-words flex justify-end">
              {specs.right.value}
            </div>
          </div>
        </div>
      )}

      {/* 4. Action Buttons Bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        {actions}
      </div>
    </div>
  );
}
