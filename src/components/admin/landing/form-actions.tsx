import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormActionsProps {
  backHref?: string;
  backLabel?: string;
  submitLabel?: string;
  isPending: boolean;
  className?: string;
}

export function FormActions({
  backHref = "/admin/landing",
  backLabel = "Kembali ke Daftar",
  submitLabel = "Simpan Perubahan",
  isPending,
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-6 border-t border-slate-100",
        className
      )}
    >
      <Link
        href={backHref}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors w-full sm:w-auto min-h-[44px] shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        <span>{backLabel}</span>
      </Link>

      <Button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] font-semibold text-sm shadow-xs"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4 shrink-0" />
            <span>{submitLabel}</span>
          </>
        )}
      </Button>
    </div>
  );
}
