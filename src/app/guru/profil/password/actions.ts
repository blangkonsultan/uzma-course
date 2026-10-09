"use server";

import { createClient } from "@/lib/supabase/server";
import { requireGuruAction } from "@/lib/auth";

export async function updatePassword(formData: FormData) {
  await requireGuruAction();
  
  const oldPassword = formData.get("oldPassword")?.toString();
  const newPassword = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!oldPassword) {
    return { error: "Kata sandi lama harus diisi." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { error: "Kata sandi baru minimal 8 karakter." };
  }
  
  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  const supabase = await createClient();
  
  // Verify old password
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: "Sesi pengguna tidak valid." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });

  if (signInError) {
    return { error: "Kata sandi lama tidak sesuai." };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
