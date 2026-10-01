"use client";

import { useState } from "react";
import { InputField } from "@/components/admin/form-field";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { ImageIcon, AlertCircle } from "lucide-react";

export interface ImageUrlFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  altValue: string;
  onAltChange: (alt: string) => void;
  hint: string;
  previewAspect?: string;
  error?: string;
  idPrefix?: string;
}

export function ImageUrlField({
  label,
  value,
  onChange,
  altValue,
  onAltChange,
  hint,
  previewAspect = "aspect-[4/3]",
  error,
  idPrefix = "img",
}: ImageUrlFieldProps) {
  const previewUrl = normalizeImageUrl(value);
  const [prevUrl, setPrevUrl] = useState(previewUrl);
  const [imgError, setImgError] = useState(false);

  // Reset error state whenever preview URL changes
  if (previewUrl !== prevUrl) {
    setPrevUrl(previewUrl);
    setImgError(false);
  }

  const handleUrlChange = (newUrl: string) => {
    // Normalize Google Drive links immediately upon paste or change
    const normalized = normalizeImageUrl(newUrl);
    setImgError(false);
    onChange(normalized);
  };

  const handleNormalizeOnBlur = () => {
    const normalized = normalizeImageUrl(value);
    if (normalized !== value) {
      setImgError(false);
      onChange(normalized);
    }
  };

  const hasValidUrl = previewUrl.trim().length > 0;
  return (
    <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
        <span className="font-semibold text-sm text-slate-800">{label}</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-4">
        <InputField
          id={`${idPrefix}-url`}
          label="URL Gambar"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          onBlur={handleNormalizeOnBlur}
          placeholder="/images/... atau https://..."
          hint={hint}
          error={error}
        />
        <InputField
          id={`${idPrefix}-alt`}
          label="Teks Alternatif (Alt Text)"
          value={altValue}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Deskripsi gambar untuk aksesibilitas & SEO"
        />
      </div>
      {(value.includes("googleusercontent.com/d/") || previewUrl.includes("googleusercontent.com/d/")) && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          ✓ Tautan Google Drive berhasil dikonversi ke direct link. Pastikan izin berbagi file di Google Drive diatur ke <strong>&ldquo;Siapa saja yang memiliki link&rdquo; (Anyone with the link)</strong> agar gambar dapat dimuat pengunjung.
        </p>
      )}

      {hasValidUrl && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 mb-1.5">
            Preview Thumbnail:
          </p>
          {imgError ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Gambar tidak dapat dimuat dari URL yang dimasukkan. Periksa kembali URL.</span>
            </div>
          ) : (
            <div
              className={cn(
                "relative w-full max-w-[280px] sm:max-w-xs h-32 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 shadow-xs",
                previewAspect
              )}
            >
              {/* Native img avoids Next.js remotePatterns restriction for arbitrary CMS URLs */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={altValue || label}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
