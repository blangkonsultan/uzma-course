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

  const bankName = formData.get("bank_name")?.toString().trim() || null;
  const bankAccountNumber = formData.get("bank_account_number")?.toString().trim() || null;
  const bankAccountHolder = formData.get("bank_account_holder")?.toString().trim() || null;

  const parseNum = (val: FormDataEntryValue | null) => {
    if (!val) return undefined;
    const n = parseInt(val.toString().replace(/\D/g, ""), 10);
    return isNaN(n) ? undefined : n;
  };

  const allowanceTransport = parseNum(formData.get("allowance_transport"));
  const allowancePresence = parseNum(formData.get("allowance_presence"));
  const allowanceCreativity = parseNum(formData.get("allowance_creativity"));
  const allowanceEducation = parseNum(formData.get("allowance_education"));
  const morningGuaranteeThreshold = parseNum(formData.get("morning_guarantee_threshold"));

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
      branch_id: branchId || null,
      is_active: true,
      bank_name: bankName,
      bank_account_number: bankAccountNumber,
      bank_account_holder: bankAccountHolder,
      allowance_transport: allowanceTransport,
      allowance_presence: allowancePresence,
      allowance_creativity: allowanceCreativity,
      allowance_education: allowanceEducation,
      morning_guarantee_threshold: morningGuaranteeThreshold,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      return { error: `Akun dibuat tetapi gagal mengisi data profil: ${profileError.message}` };
    }

    // 3. Assign profile_programs junction
    if (programs.length > 0) {
      const { error: junctionError } = await adminClient
        .from("profile_programs")
        .insert(
          programs.map((pid) => ({
            profile_id: newUserId,
            program_id: pid,
          }))
        );

      if (junctionError) {
        return { error: `Akun dibuat tetapi gagal menugaskan program: ${junctionError.message}` };
      }
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

  const bankName = formData.get("bank_name")?.toString().trim() || null;
  const bankAccountNumber = formData.get("bank_account_number")?.toString().trim() || null;
  const bankAccountHolder = formData.get("bank_account_holder")?.toString().trim() || null;

  const parseNum = (val: FormDataEntryValue | null) => {
    if (!val) return undefined;
    const n = parseInt(val.toString().replace(/\D/g, ""), 10);
    return isNaN(n) ? undefined : n;
  };

  const allowanceTransport = parseNum(formData.get("allowance_transport"));
  const allowancePresence = parseNum(formData.get("allowance_presence"));
  const allowanceCreativity = parseNum(formData.get("allowance_creativity"));
  const allowanceEducation = parseNum(formData.get("allowance_education"));
  const morningGuaranteeThreshold = parseNum(formData.get("morning_guarantee_threshold"));

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
      branch_id: branchId || null,
      is_active: isActive,
      bank_name: bankName,
      bank_account_number: bankAccountNumber,
      bank_account_holder: bankAccountHolder,
      allowance_transport: allowanceTransport,
      allowance_presence: allowancePresence,
      allowance_creativity: allowanceCreativity,
      allowance_education: allowanceEducation,
      morning_guarantee_threshold: morningGuaranteeThreshold,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("role", "guru");

  if (error) {
    return { error: error.message };
  }

  // Delete existing profile_programs and re-insert
  const { error: deleteError } = await supabase
    .from("profile_programs")
    .delete()
    .eq("profile_id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (programs.length > 0) {
    const { error: junctionError } = await supabase
      .from("profile_programs")
      .insert(
        programs.map((pid) => ({
          profile_id: id,
          program_id: pid,
        }))
      );

    if (junctionError) {
      return { error: junctionError.message };
    }
  }

  revalidatePath("/admin/guru");
  revalidatePath(`/admin/guru/${id}/edit`);
  revalidatePath("/admin");
  redirect("/admin/guru?success=" + encodeURIComponent("Data guru berhasil diperbarui"));
}

export async function toggleGuruActive(id: string, currentStatus: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("role", "guru");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/guru");
  revalidatePath("/admin");
  return { success: true };
}
