"use client";

import { useState, useTransition } from "react";
import { toggleGuruActive } from "@/app/admin/guru/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { showToast } from "@/components/admin/toast";
import { UserX, UserCheck } from "lucide-react";

interface GuruStatusButtonProps {
  guruId: string;
  guruName: string;
  isActive: boolean;
  showLabel?: boolean;
  className?: string;
}

export function GuruStatusButton({
  guruId,
  guruName,
  isActive,
  showLabel = false,
  className,
}: GuruStatusButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  function handleConfirm() {
    startTransition(async () => {
      try {
        await toggleGuruActive(guruId, isActive);
        setDialogOpen(false);
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "Gagal memperbarui status aktif guru.",
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
        className={
          className ||
          `p-2 sm:p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-lg transition-colors ${
            isActive
              ? "text-rose-600 hover:bg-rose-50"
              : "text-emerald-600 hover:bg-emerald-50"
          }`
        }
        title={isActive ? "Nonaktifkan Guru" : "Aktifkan Guru"}
        aria-label={isActive ? `Nonaktifkan ${guruName}` : `Aktifkan ${guruName}`}
      >
        {isActive ? (
          <UserX className="w-4 h-4 shrink-0" />
        ) : (
          <UserCheck className="w-4 h-4 shrink-0" />
        )}
        {showLabel && (
          <span>{isActive ? "Nonaktifkan" : "Aktifkan"}</span>
        )}
      </button>

      <ConfirmDialog
        isOpen={dialogOpen}
        title={
          isActive
            ? `Nonaktifkan Guru "${guruName}"?`
            : `Aktifkan Kembali Guru "${guruName}"?`
        }
        description={
          isActive
            ? "Guru yang dinonaktifkan tidak akan dapat masuk ke portal ini sampai diaktifkan kembali oleh Admin."
            : "Akun guru akan diaktifkan kembali dan dapat masuk ke portal ini."
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
