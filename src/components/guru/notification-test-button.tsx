"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, Send } from "lucide-react";
import { showToast } from "@/components/admin/toast";

export function NotificationTestButton() {
  const [testing, setTesting] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Periksa izin saat pertama kali dibuka
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const savedPref = localStorage.getItem("pwa_notif_enabled");
      const isGranted = Notification.permission === "granted";
      
      // Aktif jika izin granted DAN user tidak sengaja mematikan di localStorage
      if (isGranted && savedPref !== "false") {
        setIsEnabled(true);
      } else {
        setIsEnabled(false);
      }
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
          const regs = await navigator.serviceWorker.getRegistrations();
          const reg = regs.length > 0 ? regs[0] : await navigator.serviceWorker.getRegistration();

          if (reg && reg.showNotification) {
            await reg.showNotification("Uzma Course", {
              body: "Notifikasi PWA berfungsi dengan baik! 🔔",
              icon: "/icon.jpeg",
              badge: "/icon.jpeg",
            });
            shown = true;
          } else {
            errorMessage = "Service Worker belum aktif sepenuhnya.";
          }
        } catch (e: unknown) {
          if (e instanceof Error) errorMessage = e.message;
        }
      }

      if (!shown) {
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
    <div className="p-4 border-b border-slate-100 flex flex-col space-y-3">
      {/* Baris Toggle Izin */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-slate-700">
          <Bell className="w-5 h-5 text-slate-400" />
          <div>
            <span className="font-medium text-sm block">Notifikasi Perangkat</span>
            <span className="text-[11px] text-slate-400 block">
              {isEnabled ? "Izin aktif & terhubung" : "Izin nonaktif / belum diberikan"}
            </span>
          </div>
        </div>

        {/* Sakelar Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          onClick={() => void handleToggle()}
          disabled={isRequesting}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
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

      {/* Baris Tombol Uji Coba */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-500">
          Uji coba mengirim notifikasi ke bilah HP
        </span>

        <button
          type="button"
          onClick={() => void handleCheckNotification()}
          disabled={!isEnabled || testing}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            isEnabled && !testing
              ? "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 cursor-pointer shadow-2xs"
              : "bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-70"
          }`}
        >
          {testing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
              <span>Mengirim...</span>
            </>
          ) : (
            <>
              <Send className="w-3 h-3" />
              <span>Uji Coba</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
