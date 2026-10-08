import { requireGuruPage } from "@/lib/auth";
import { GuruBottomNav } from "@/components/guru/guru-bottom-nav";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireGuruPage();

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 relative pb-16">
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto bg-white shadow-sm h-full">
        {children}
      </main>

      <GuruBottomNav />
    </div>
  );
}
