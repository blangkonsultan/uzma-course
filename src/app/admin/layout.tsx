import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
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

  const [profile, branches] = await Promise.all([
    getCurrentProfile(user.id),
    getBranches(),
  ]);
  if (profile?.role !== "admin") {
    redirect("/guru");
  }

  const safeProfile: Profile = profile;
  return (
    <AdminShell profile={safeProfile} branches={branches}>
      {children}
    </AdminShell>
  );
}
