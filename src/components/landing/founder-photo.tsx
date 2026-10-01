"use client";

import { useState } from "react";
import { normalizeImageUrl } from "@/lib/utils";

export interface FounderPhotoProps {
  src?: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

export function FounderPhoto({
  src,
  alt,
  fallbackSrc = "/images/founder-fallback.webp",
  className = "w-full h-full object-cover",
}: FounderPhotoProps) {
  const targetSrc = src?.trim() ? normalizeImageUrl(src) : fallbackSrc;
  const [prevTargetSrc, setPrevTargetSrc] = useState(targetSrc);
  const [hasError, setHasError] = useState(false);

  if (targetSrc !== prevTargetSrc) {
    setPrevTargetSrc(targetSrc);
    setHasError(false);
  }

  return (
    // Native img avoids Next.js remotePatterns restriction for arbitrary CMS / upload URLs
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hasError ? fallbackSrc : targetSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
      className={className}
    />
  );
}
