"use client";

import React, { useState, useRef, useTransition } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadProgramLogo, deleteProgramLogo } from "@/app/admin/landing/upload-logo";

const MAX_SIZE = 512 * 1024; // 512 KB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export interface LogoUploadFieldProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  programId: string;
  className?: string;
}

export function LogoUploadField({
  value,
  onChange,
  programId,
  className,
}: LogoUploadFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Client-side validation
    if (file.size > MAX_SIZE) {
      setError("Ukuran file melebihi 512 KB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format file tidak didukung. Gunakan PNG, JPEG, WebP, atau SVG.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadProgramLogo(programId, formData);

      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        onChange(result.url);
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteProgramLogo(programId);
      if (result.error) {
        setError(result.error);
      } else {
        onChange(undefined);
      }
    });
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3",
        className
      )}
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Logo Resmi Franchise
        </label>
        <p className="text-xs text-slate-500 mt-0.5">
          PNG, JPEG, WebP, atau SVG. Maksimal 512 KB, disarankan 200×200 px persegi.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={isPending}
        id={`logo-upload-${programId}`}
      />

      {value ? (
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-xs">
            <img
              src={value}
              alt="Logo Franchise"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              )}
              <span>Ganti Logo</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
              )}
              <span>Hapus</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 hover:border-primary-400 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 bg-white text-slate-600 transition-colors group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" aria-hidden="true" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-primary-50 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" aria-hidden="true" />
              </div>
            )}
            <p className="text-xs font-medium text-slate-700">
              {isPending ? "Mengunggah logo..." : "Klik untuk memilih file logo"}
            </p>
            <p className="text-[11px] text-slate-400">
              Transparan (PNG/SVG) disarankan
            </p>
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
