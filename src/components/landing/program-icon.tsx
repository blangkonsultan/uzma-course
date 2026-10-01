"use client";

import { useState } from "react";
import { LUCIDE_ICON_MAP } from "@/components/admin/landing/icon-select-field";
import { BookOpen } from "lucide-react";

export interface ProgramIconProps {
  logoUrl?: string;
  icon: string;
  name: string;
}

export function ProgramIcon({ logoUrl, icon, name }: ProgramIconProps) {
  const [imgError, setImgError] = useState(false);
  const FallbackIcon = LUCIDE_ICON_MAP[icon] || BookOpen;

  if (logoUrl && !imgError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={logoUrl}
        alt={`Logo ${name}`}
        className="w-7 h-7 object-contain"
        onError={() => setImgError(true)}
      />
    );
  }
  return <FallbackIcon className="w-6 h-6" aria-hidden="true" />;
}
