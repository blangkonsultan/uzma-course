import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/types";

export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function requireAdminAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesi tidak valid atau telah berakhir.");
  }

  const profile = await getCurrentProfile(user.id);
  
  if (profile?.role !== "admin") {
    throw new Error("Hanya admin yang memiliki izin untuk operasi ini.");
  }

  return { user, profile };
}

export async function requireAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentProfile = await getCurrentProfile(user.id);

  if (currentProfile?.role !== "admin") {
    redirect(currentProfile?.role === "guru" ? "/guru" : "/");
  }

  return { user, profile: currentProfile, supabase };
}

export async function requireGuruPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentProfile = await getCurrentProfile(user.id);

  if (currentProfile?.role !== "guru") {
    redirect(currentProfile?.role === "admin" ? "/admin" : "/");
  }

  return { user, profile: currentProfile, supabase };
}

export async function requireGuruAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesi tidak valid atau telah berakhir.");
  }

  const profile = await getCurrentProfile(user.id);
  
  if (profile?.role !== "guru") {
    throw new Error("Hanya guru yang memiliki izin untuk operasi ini.");
  }

  return { user, profile };
}
