"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/app/guru/profil/password/actions";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/admin/form-field";
import { showToast } from "@/components/admin/toast";
import { Loader2, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

export function PasswordForm() {
  const router = useRouter();
  
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (password.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsPending(true);
    
    try {
      const formData = new FormData();
      formData.append("oldPassword", oldPassword);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const res = await updatePassword(formData);
      
      if (res.error) {
        setError(res.error);
        showToast(res.error, "error");
      } else if (res.success) {
        showToast("Kata sandi berhasil diubah!", "success");
        router.push("/guru/profil");
      }
    } catch {
      setError("Terjadi kesalahan sistem.");
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
        <Link href="/guru/profil" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center space-x-2 text-slate-800">
          <KeyRound className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-lg">Ganti Kata Sandi</h2>
        </div>
      </div>
      
      <div className="p-5">
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <InputField
            id="oldPassword"
            name="oldPassword"
            label="Kata Sandi Lama"
            type="password"
            required
            placeholder="Masukkan kata sandi lama Anda"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={isPending}
          />
          
          <InputField
            id="password"
            name="password"
            label="Kata Sandi Baru"
            type="password"
            required
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
          />
          
          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            required
            placeholder="Tulis ulang kata sandi baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
          />

          <Button
            type="submit"
            className="w-full mt-4 py-6 bg-blue-600 hover:bg-blue-700"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : null}
            <span className="font-semibold">Simpan Kata Sandi</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
