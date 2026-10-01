"use client";

import { useState } from "react";
import { InputField } from "@/components/admin/form-field";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { ImageIcon, AlertCircle } from "lucide-react";

const PREVIEW_ASPECT_CLASSES: Record<string, string> = {
  "aspect-square": "w-36 sm:w-44 aspect-square rounded-2xl",
  "aspect-[4/3]": "w-52 sm:w-64 aspect-[4/3] rounded-xl",
  "aspect-[16/9]": "w-64 sm:w-80 aspect-[16/9] rounded-xl",
  "aspect-[21/9]": "w-full max-w-xs sm:max-w-md aspect-[21/9] rounded-xl",
};

const ASPECT_LABELS: Record<string, string> = {
  "aspect-square": "1:1 Persegi",
  "aspect-[4/3]": "4:3 Landscape",
  "aspect-[16/9]": "16:9 Widescreen",
  "aspect-[21/9]": "21:9 Panorama",
};

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
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-xs font-medium text-slate-500">
              Preview Thumbnail:
            </p>
            {ASPECT_LABELS[previewAspect] && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                {ASPECT_LABELS[previewAspect]}
              </span>
            )}
          </div>
          {imgError ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Gambar tidak dapat dimuat dari URL yang dimasukkan. Periksa kembali URL.</span>
            </div>
          ) : (
            <div
              className={cn(
                "relative overflow-hidden border border-slate-300 bg-slate-100 shadow-xs",
                PREVIEW_ASPECT_CLASSES[previewAspect] || cn("w-52 max-w-full rounded-xl", previewAspect)
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
