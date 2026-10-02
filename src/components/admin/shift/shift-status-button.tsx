"use client";

import { useState, useTransition } from "react";
import { toggleShiftActive } from "@/app/admin/shift/actions";
import { Power, PowerOff, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { showToast } from "@/components/admin/toast";

export interface ShiftStatusButtonProps {
  shiftId: string;
  shiftName: string;
  isActive: boolean;
  className?: string;
}

export function ShiftStatusButton({
  shiftId,
  shiftName,
  isActive,
  className,
}: ShiftStatusButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggle = () => {
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await toggleShiftActive(shiftId, isActive);
        showToast(
          `Shift ${shiftName} berhasil di${isActive ? "nonaktifkan" : "aktifkan"}.`,
          "success"
        );
        setDialogOpen(false);
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "Gagal memperbarui status aktif shift.",
          "error"
        );
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={
          className ??
          `p-2 sm:p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-lg transition-colors flex items-center justify-center ${
            isActive
              ? "text-rose-600 hover:bg-rose-50"
              : "text-emerald-600 hover:bg-emerald-50"
          } disabled:opacity-50 disabled:cursor-not-allowed`
        }
        title={isActive ? "Nonaktifkan Shift" : "Aktifkan Shift"}
        aria-label={`${isActive ? "Nonaktifkan" : "Aktifkan"} shift ${shiftName}`}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isActive ? (
          <PowerOff className="w-4 h-4" />
        ) : (
          <Power className="w-4 h-4" />
        )}
      </button>

      <ConfirmDialog
        isOpen={dialogOpen}
        title={isActive ? "Nonaktifkan Shift" : "Aktifkan Shift"}
        description={
          isActive
            ? `Apakah Anda yakin ingin menonaktifkan shift "${shiftName}"? Shift ini tidak akan bisa digunakan untuk jadwal baru.`
            : `Apakah Anda yakin ingin mengaktifkan kembali shift "${shiftName}"?`
        }
        confirmText={isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
        variant={isActive ? "danger" : "primary"}
        onConfirm={handleConfirm}
        onCancel={() => setDialogOpen(false)}
        isLoading={isPending}
      />
    </>
  );
}
