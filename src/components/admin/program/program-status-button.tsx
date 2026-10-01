"use client";

import { useState, useTransition } from "react";
import { toggleProgramActive } from "@/app/admin/program/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EyeOff, Eye } from "lucide-react";

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
        setDialogOpen(false);
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Gagal memperbarui status aktif program."
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className={
          className ??
          `p-1.5 rounded-lg transition-colors ${
            isActive
              ? "text-rose-600 hover:bg-rose-50"
              : "text-emerald-600 hover:bg-emerald-50"
          }`
        }
        title={isActive ? "Nonaktifkan Program" : "Aktifkan Program"}
        aria-label={isActive ? `Nonaktifkan ${programName}` : `Aktifkan ${programName}`}
      >
        {isActive ? (
          <EyeOff className="w-4 h-4 shrink-0" />
        ) : (
          <Eye className="w-4 h-4 shrink-0" />
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
