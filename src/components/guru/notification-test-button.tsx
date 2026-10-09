"use client";

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { showToast } from "@/components/admin/toast";

export function NotificationTestButton() {
  const [testing, setTesting] = useState(false);

  async function handleCheckNotification() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Perangkat/browser ini tidak mendukung Web Notifications.", "error");
      return;
    }

    setTesting(true);

    try {
      let perm = Notification.permission;

      if (perm === "default") {
        perm = await Notification.requestPermission();
      }

      if (perm === "granted") {
        // Try displaying via Service Worker registration first if active, fallback to new Notification
        let shown = false;
        if ("serviceWorker" in navigator) {
          try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
              await reg.showNotification("Uzma Course PWA", {
                body: "Notifikasi sistem berfungsi dengan baik! 🔔",
                icon: "/icon.jpeg",
                badge: "/icon.jpeg",
              });
              shown = true;
            }
          } catch {
            shown = false;
          }
        }

        if (!shown) {
          new Notification("Uzma Course PWA", {
            body: "Notifikasi sistem berfungsi dengan baik! 🔔",
            icon: "/icon.jpeg",
          });
        }

        showToast("Notifikasi berhasil dikirim!", "success");
      } else if (perm === "denied") {
        showToast("Izin notifikasi diblokir. Harap aktifkan di pengaturan browser.", "error");
      } else {
        showToast("Izin notifikasi belum diberikan.", "error");
      }
    } catch {
      showToast("Gagal memicu notifikasi pada perangkat ini.", "error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCheckNotification()}
      disabled={testing}
      className="p-4 flex items-center justify-between border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors w-full text-left"
    >
      <div className="flex items-center space-x-3 text-slate-700">
        <Bell className="w-5 h-5 text-slate-400" />
        <span className="font-medium">Cek Notifikasi</span>
      </div>
      {testing ? (
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      ) : (
        <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
          Uji Coba
        </span>
      )}
    </button>
  );
}
