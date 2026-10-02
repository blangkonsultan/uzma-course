import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    redirect("/admin");
  }

  return { user, profile: currentProfile, supabase };
}
