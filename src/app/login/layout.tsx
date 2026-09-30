import type { Metadata } from "next";
import { Toast } from "@/components/admin/toast";

export const metadata: Metadata = {
  title: "Login — Portal Admin & Guru",
  description: "Masuk ke portal administrasi dan manajemen guru Uzma Course.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/20 to-purple-50/40 p-4 sm:p-6"
    >
      <div className="w-full max-w-md">
        {children}
      </div>
      <Toast />
    </main>
  );
}
