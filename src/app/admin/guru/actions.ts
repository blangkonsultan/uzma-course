"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Hanya admin yang memiliki izin untuk operasi ini.");
  }

  return { user, supabase };
}
export interface GuruActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createGuru(formData: FormData): Promise<GuruActionResponse | void> {
  await requireAdmin();

  const fullName = formData.get("full_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const phone = formData.get("phone")?.toString().trim() || null;
  const branchId = formData.get("branch_id")?.toString().trim() || null;
  const programs = formData.getAll("programs").map((p) => p.toString());

  const fieldErrors: Record<string, string> = {};

  if (!fullName || fullName.length < 2) {
    fieldErrors.full_name = "Nama lengkap minimal 2 karakter.";
  }
  if (!email || !email.includes("@")) {
    fieldErrors.email = "Format email tidak valid.";
  }
  if (!password || password.length < 8) {
    fieldErrors.password = "Kata sandi minimal 8 karakter.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }
  try {
    const adminClient = createAdminClient();

    // 1. Create auth user with service role
    const { data: userData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: "guru",
        },
      });

    if (authError || !userData.user) {
      const msg = authError?.message || "";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("exists")) {
        return { fieldErrors: { email: "Email ini sudah terdaftar sebagai pengguna." } };
      }
      return { error: msg || "Gagal membuat akun autentikasi guru." };
    }
    const newUserId = userData.user.id;

    // 2. Update the profile row (created by trigger or upsert)
    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: newUserId,
      full_name: fullName!,
      phone,
      role: "guru",
      branch_id: branchId as "balongbendo" | "krian" | null,
      programs,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      return { error: `Akun dibuat tetapi gagal mengisi data profil: ${profileError.message}` };
    }
  } catch (err: unknown) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Gagal menghubungkan ke layanan Supabase.",
    };
  }

  revalidatePath("/admin/guru");
  revalidatePath("/admin");
  redirect("/admin/guru?success=" + encodeURIComponent("Guru berhasil ditambahkan"));
}

export async function updateGuru(id: string, formData: FormData): Promise<GuruActionResponse | void> {
  const { supabase } = await requireAdmin();

  const fullName = formData.get("full_name")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim() || null;
  const branchId = formData.get("branch_id")?.toString().trim() || null;
  const programs = formData.getAll("programs").map((p) => p.toString());
  const isActive = formData.get("is_active") === "true";

  const fieldErrors: Record<string, string> = {};

  if (!fullName || fullName.length < 2) {
    fieldErrors.full_name = "Nama lengkap minimal 2 karakter.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      branch_id: branchId as "balongbendo" | "krian" | null,
      programs,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("role", "guru");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/guru");
  revalidatePath(`/admin/guru/${id}/edit`);
  revalidatePath("/admin");
  redirect("/admin/guru?success=" + encodeURIComponent("Data guru berhasil diperbarui"));
}

export async function toggleGuruActive(id: string, currentStatus: boolean) {
  const { supabase } = await requireAdmin();

  const nextStatus = !currentStatus;

  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("role", "guru");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/guru");
  revalidatePath("/admin");
}
