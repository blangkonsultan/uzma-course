"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastEventDetail {
  message: string;
  type: ToastType;
}

export function showToast(message: string, type: ToastType = "error") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ToastEventDetail>("app-toast", {
        detail: { message, type },
      })
    );
  }
}
function ToastContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const successMessage = searchParams.get("success");
  const errorMessage = searchParams.get("error");
  const message = successMessage || errorMessage;

  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);
  const [dynamicToast, setDynamicToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    function handleToastEvent(e: Event) {
      const customEvent = e as CustomEvent<ToastEventDetail>;
      if (customEvent.detail?.message) {
        setDynamicToast({
          message: customEvent.detail.message,
          type: customEvent.detail.type || "error",
        });
      }
    }

    window.addEventListener("app-toast", handleToastEvent);
    return () => window.removeEventListener("app-toast", handleToastEvent);
  }, []);

  const currentMessage = dynamicToast?.message || (message !== dismissedMessage ? message : null);
  const isSuccess = dynamicToast ? dynamicToast.type === "success" : Boolean(successMessage);
  const isVisible = Boolean(currentMessage);
  const dismissToast = useCallback(() => {
    if (dynamicToast) {
      setDynamicToast(null);
    }
    if (message) {
      setDismissedMessage(message);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      params.delete("error");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [dynamicToast, message, pathname, router, searchParams]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      dismissToast();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible, dismissToast]);

  if (!isVisible || !currentMessage) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div
        className={`p-2 rounded-xl shrink-0 ${
          isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 pt-0.5">
        <p className="text-xs font-semibold text-slate-900">
          {isSuccess ? "Berhasil" : "Terjadi Kesalahan"}
        </p>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
          {currentMessage}
        </p>
      </div>

      <button
        type="button"
        onClick={dismissToast}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function Toast() {
  return (
    <Suspense fallback={null}>
      <ToastContent />
    </Suspense>
  );
}
