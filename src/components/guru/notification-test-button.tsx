"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, Send } from "lucide-react";
import { showToast } from "@/components/admin/toast";

export function NotificationTestButton() {
  const [testing, setTesting] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");

  // Periksa izin saat pertama kali dibuka
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const savedPref = localStorage.getItem("pwa_notif_enabled");
      const perm = Notification.permission;
      const active = perm === "granted" && savedPref !== "false";

      queueMicrotask(() => {
        setPermissionStatus(perm);
        setIsEnabled(active);
      });
    } else {
      queueMicrotask(() => {
        setPermissionStatus("unsupported");
      });
    }
  }, []);

  async function handleToggle() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Perangkat/browser ini tidak mendukung Web Notifications.", "error");
      return;
    }

    // Jika ingin MEMATIKAN
    if (isEnabled) {
      setIsEnabled(false);
      localStorage.setItem("pwa_notif_enabled", "false");
      showToast("Notifikasi dinonaktifkan di aplikasi.", "error");
      return;
    }

    // Jika ingin MENGAKTIFKAN & REQUEST PERMISSION
    setIsRequesting(true);
    try {
      let perm = Notification.permission;

      if (perm !== "granted") {
        perm = await Notification.requestPermission();
        setPermissionStatus(perm);
      }

      if (perm === "granted") {
        setIsEnabled(true);
        localStorage.setItem("pwa_notif_enabled", "true");
        showToast("Izin notifikasi berhasil diaktifkan!", "success");
      } else if (perm === "denied") {
        setIsEnabled(false);
        localStorage.setItem("pwa_notif_enabled", "false");
        showToast("Izin diblokir. Harap buka Pengaturan Browser/HP Anda untuk mengizinkan.", "error");
      } else {
        setIsEnabled(false);
        showToast("Izin notifikasi belum diberikan.", "error");
      }
    } catch {
      showToast("Gagal meminta izin notifikasi.", "error");
    } finally {
      setIsRequesting(false);
    }
  }

  async function handleCheckNotification() {
    if (!isEnabled) {
      showToast("Aktifkan sakelar notifikasi terlebih dahulu.", "error");
      return;
    }

    setTesting(true);

    try {
      let shown = false;
      let errorMessage = "";

      if ("serviceWorker" in navigator) {
        try {
          let reg: ServiceWorkerRegistration | undefined;
          const regs = await navigator.serviceWorker.getRegistrations();
          if (regs.length > 0) {
            reg = regs[0];
          } else {
            reg = (await navigator.serviceWorker.getRegistration()) ?? undefined;
          }

          if (!reg) {
            reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          }

          const readyPromise = navigator.serviceWorker.ready;
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout menunggu Service Worker aktif.")), 4000)
          );
          const activeReg = (await Promise.race([readyPromise, timeoutPromise])) as ServiceWorkerRegistration;

          if (activeReg && activeReg.showNotification) {
            await activeReg.showNotification("Uzma Course", {
              body: "Notifikasi PWA berfungsi dengan baik! 🔔",
              icon: "/icon.jpeg",
              badge: "/icon.jpeg",
              tag: "uzma-test-notification",
            });
            shown = true;
          } else {
            errorMessage = "Service Worker belum aktif sepenuhnya.";
          }
        } catch (e: unknown) {
          if (e instanceof Error) errorMessage = e.message;
        }
      }

      if (!shown && typeof window !== "undefined" && "Notification" in window) {
        try {
          new Notification("Uzma Course", {
            body: "Notifikasi PWA berfungsi dengan baik! 🔔",
            icon: "/icon.jpeg",
          });
          shown = true;
        } catch (err: unknown) {
          if (err instanceof Error) errorMessage = err.message;
        }
      }

      if (shown) {
        showToast("Notifikasi berhasil dikirim ke perangkat!", "success");
      } else {
        showToast(`Gagal: ${errorMessage || "Perangkat menolak notifikasi"}`, "error");
      }
    } catch {
      showToast("Gagal memicu notifikasi pada perangkat ini.", "error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="border-b border-slate-100 transition-colors">
      {/* Baris Toggle Izin Utama */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-slate-700 min-w-0">
          <Bell className={`w-5 h-5 shrink-0 transition-colors ${isEnabled ? "text-primary-600" : "text-slate-400"}`} />
          <div className="min-w-0">
            <span className="font-medium text-slate-800 text-sm block">Notifikasi Perangkat</span>
            <span className="text-[11px] block mt-0.5">
              {isRequesting ? (
                <span className="text-primary-600 flex items-center gap-1 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin inline shrink-0" />
                  Meminta izin...
                </span>
              ) : permissionStatus === "unsupported" ? (
                <span className="text-slate-400">Tidak didukung di perangkat ini</span>
              ) : permissionStatus === "denied" && !isEnabled ? (
                <span className="text-amber-600 font-medium">Izin diblokir di browser</span>
              ) : isEnabled ? (
                <span className="text-emerald-600 font-medium">Izin aktif &amp; terhubung</span>
              ) : (
                <span className="text-slate-400">Izin nonaktif</span>
              )}
            </span>
          </div>
        </div>

        {/* Sakelar Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-label="Aktifkan notifikasi perangkat"
          onClick={() => void handleToggle()}
          disabled={isRequesting}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 ${
            isEnabled ? "bg-primary-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Sub-panel Uji Coba Diagnostik (Progressive Disclosure: Hanya saat aktif) */}
      {isEnabled && (
        <div className="px-4 pb-4 pt-0">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-700 block">
                Tes Pengiriman
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5 leading-snug">
                Kirim pesan uji coba ke bilah HP
              </span>
            </div>

            <button
              type="button"
              onClick={() => void handleCheckNotification()}
              disabled={testing}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap bg-white text-primary-700 hover:bg-primary-50 active:scale-95 border border-primary-200/80 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600 shrink-0" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 text-primary-600 shrink-0" />
                  <span>Uji Coba</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
