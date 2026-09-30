"use client";

import { useState, useEffect } from "react";
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
  const initialSrc = src?.trim() ? normalizeImageUrl(src) : fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const nextSrc = src?.trim() ? normalizeImageUrl(src) : fallbackSrc;
    setCurrentSrc(nextSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    // Native img avoids Next.js remotePatterns restriction for arbitrary CMS / upload URLs
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hasError ? fallbackSrc : currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!hasError && currentSrc !== fallbackSrc) {
          setHasError(true);
          setCurrentSrc(fallbackSrc);
        }
      }}
      className={className}
    />
  );
}
