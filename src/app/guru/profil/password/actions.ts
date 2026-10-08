"use server";

import { createClient } from "@/lib/supabase/server";
import { requireGuruAction } from "@/lib/auth";

export async function updatePassword(formData: FormData) {
  await requireGuruAction();
  
  const newPassword = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!newPassword || newPassword.length < 8) {
    return { error: "Kata sandi baru minimal 8 karakter." };
  }
  
  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
