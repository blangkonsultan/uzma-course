"use client";

import { useState, useTransition } from "react";
import { toggleStudentActive } from "@/app/admin/murid/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { showToast } from "@/components/admin/toast";
import { UserX, UserCheck } from "lucide-react";

interface StudentStatusButtonProps {
  studentId: string;
  studentName: string;
  isActive: boolean;
  showLabel?: boolean;
  className?: string;
}

export function StudentStatusButton({
  studentId,
  studentName,
  isActive,
  showLabel = false,
  className,
}: StudentStatusButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  function handleConfirm() {
    startTransition(async () => {
      try {
        await toggleStudentActive(studentId, isActive);
        setDialogOpen(false);
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "Gagal memperbarui status aktif murid.",
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
        title={isActive ? "Nonaktifkan Murid" : "Aktifkan Murid"}
        aria-label={isActive ? `Nonaktifkan ${studentName}` : `Aktifkan ${studentName}`}
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
            ? `Nonaktifkan Murid "${studentName}"?`
            : `Aktifkan Kembali Murid "${studentName}"?`
        }
        description={
          isActive
            ? "Murid yang dinonaktifkan akan ditandai non-aktif dan tidak muncul di jadwal aktif."
            : "Data murid akan diaktifkan kembali dalam daftar murid aktif."
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
