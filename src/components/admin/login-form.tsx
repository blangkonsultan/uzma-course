"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { InputField } from "@/components/admin/form-field";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (
          signInError.message.includes("Invalid login credentials") ||
          signInError.message.includes("invalid_grant")
        ) {
          setError("Email atau kata sandi tidak sesuai.");
        } else {
          setError(signInError.message || "Gagal masuk. Silakan coba lagi.");
        }
        setIsLoading(false);
        return;
      }

      // Successful sign in, push to destination and refresh session
      router.push(nextUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan pada sistem. Silakan coba lagi."
      );
      setIsLoading(false);
    }
  }

  return (
    <Card className="border border-slate-200/80 shadow-lg shadow-purple-500/5 overflow-hidden">
      <CardHeader className="text-center pt-8 pb-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200/80 mx-auto mb-3 shadow-xs bg-white p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-uzma-course.jpg"
            alt="Logo Uzma Course"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
          Uzma Course
        </h1>
        <p className="text-xs font-semibold text-primary-600 tracking-wider uppercase mt-1">
          Portal Admin & Guru
        </p>
      </CardHeader>

      <CardBody className="pt-2 pb-8 px-6 sm:px-8">
        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            id="email"
            name="email"
            type="email"
            label="Email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />

          <InputField
            id="password"
            name="password"
            type="password"
            label="Kata Sandi"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          <Button
            type="submit"
            size="md"
            disabled={isLoading}
            className="w-full mt-2 font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Masuk ke Portal"
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Akun guru dan staf didaftarkan secara terpusat oleh Admin.
          </p>
          <div className="mt-3">
            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors"
            >
              ← Kembali ke Beranda Landing Page
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
