"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<Element | null>(null);
  useEffect(() => {
    function getFocusableElements(): HTMLElement[] {
      if (!dialogRef.current) return [];
      return Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        )
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onCancel();
        return;
      }

      if (e.key === "Tab" && isOpen) {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current?.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !dialogRef.current?.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    if (isOpen) {
      previousActiveElementRef.current = document.activeElement;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      // Auto-focus the dialog container
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElementRef.current instanceof HTMLElement) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 outline-none"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full shrink-0 ${
                variant === "danger"
                  ? "bg-rose-100 text-rose-600"
                  : "bg-primary-100 text-primary-600"
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3
                id="confirm-dialog-title"
                className="text-lg font-semibold text-slate-900"
              >
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-600 hover:text-slate-800 hover:bg-slate-200/60"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-primary-600 hover:bg-primary-700 text-white"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
