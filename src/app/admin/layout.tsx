import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBranches } from "@/lib/branches";
import { AdminShell } from "@/components/admin/admin-shell";
import type { Profile } from "@/types";

export const metadata: Metadata = {
  title: "Admin Dashboard | Uzma Course",
  description: "Dashboard manajemen operasional Uzma Course.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, branches] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getBranches(),
  ]);

  const safeProfile: Profile = profile ?? {
    id: user.id,
    full_name:
      (user.user_metadata?.full_name as string) ||
      user.email?.split("@")[0] ||
      "Pengguna",
    phone: null,
    role: (user.user_metadata?.role as "admin" | "guru") || "guru",
    branch_id: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <AdminShell profile={safeProfile} branches={branches}>
      {children}
    </AdminShell>
  );
}
