"use client";

import { useState, useTransition } from "react";
import { toggleProgramActive } from "@/app/admin/program/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { showToast } from "@/components/admin/toast";
import { Power, PowerOff, Loader2 } from "lucide-react";

interface ProgramStatusButtonProps {
  programId: string;
  programName: string;
  isActive: boolean;
  showLabel?: boolean;
  className?: string;
}

export function ProgramStatusButton({
  programId,
  programName,
  isActive,
  showLabel = false,
  className,
}: ProgramStatusButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await toggleProgramActive(programId, isActive);
        showToast(
          `Program ${programName} berhasil di${isActive ? "nonaktifkan" : "aktifkan"}.`,
          "success"
        );
        setDialogOpen(false);
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "Gagal memperbarui status aktif program.",
          "error"
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        disabled={isPending}
        className={
          className ??
          `p-2 sm:p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            isActive
              ? "text-rose-600 hover:bg-rose-50"
              : "text-emerald-600 hover:bg-emerald-50"
          } disabled:opacity-50 disabled:cursor-not-allowed`
        }
        title={isActive ? "Nonaktifkan Program" : "Aktifkan Program"}
        aria-label={isActive ? `Nonaktifkan ${programName}` : `Aktifkan ${programName}`}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : isActive ? (
          <PowerOff className="w-4 h-4 shrink-0" />
        ) : (
          <Power className="w-4 h-4 shrink-0" />
        )}
        {showLabel && (
          <span>{isActive ? "Nonaktifkan" : "Aktifkan"}</span>
        )}
      </button>

      <ConfirmDialog
        isOpen={dialogOpen}
        title={
          isActive
            ? `Nonaktifkan Program "${programName}"?`
            : `Aktifkan Kembali Program "${programName}"?`
        }
        description={
          isActive
            ? "Program yang dinonaktifkan tidak akan muncul pada pilihan pendaftaran murid baru atau form pengajar."
            : "Program akan diaktifkan kembali dan dapat dipilih pada pendaftaran murid & pengajar."
        }
        confirmText={isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
        cancelText="Batal"
        variant={isActive ? "danger" : "primary"}
        isLoading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
}
