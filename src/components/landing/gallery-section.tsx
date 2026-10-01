"use client";

import { useState, useMemo } from "react";
import { ZoomIn } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import { normalizeImageUrl } from "@/lib/utils";
import type { GalleryContent } from "@/types/landing";
import {
  GalleryLightbox,
  type LightboxImageItem,
} from "@/components/landing/gallery-lightbox";

export interface GallerySectionProps {
  data?: GalleryContent;
}

export function GallerySection({ data }: GallerySectionProps) {
  const content = data || DEFAULT_LANDING_CONTENT.gallery;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const groupsWithImages = useMemo(
    () => (content.groups || []).filter((g) => g.images && g.images.length > 0),
    [content.groups]
  );

  // Flatten all images across visible groups for sequential lightbox navigation
  const allImages = useMemo(() => {
    const list: LightboxImageItem[] = [];
    groupsWithImages.forEach((group) => {
      group.images.forEach((img) => {
        list.push({
          url: img.url,
          alt: img.alt,
          groupLabel: group.label,
        });
      });
    });
    return list;
  }, [groupsWithImages]);

  // Compute starting index offset for each group purely without mutation
  const groupOffsets = useMemo(() => {
    return groupsWithImages.reduce<number[]>((acc, _, index) => {
      if (index === 0) {
        return [0];
      }
      const prevOffset = acc[index - 1] ?? 0;
      const prevLength = groupsWithImages[index - 1]?.images.length ?? 0;
      return [...acc, prevOffset + prevLength];
    }, []);
  }, [groupsWithImages]);

  return (
    <section id="galeri" className="py-20 bg-slate-50 scroll-mt-16">
      <Container>
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        {groupsWithImages.length > 0 && (
          <div className="mt-12 space-y-12">
            {groupsWithImages.map((group, groupIdx) => {
              const startIdx = groupOffsets[groupIdx];

              return (
                <div key={groupIdx} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-800 tracking-tight">
                      {group.label}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                      {group.images.length} Foto
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {group.images.map((img, i) => {
                      const globalIdx = startIdx + i;
                      const imageAlt =
                        img.alt || `${group.label} - Foto ${i + 1}`;

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setLightboxIndex(globalIdx)}
                          className="group relative aspect-square w-full rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-2xs hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-all cursor-pointer text-left p-0"
                          aria-label={`Buka foto: ${imageAlt}`}
                        >
                          {/* Native img avoids Next.js remotePatterns restriction for arbitrary CMS URLs */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={normalizeImageUrl(img.url)}
                            alt={imageAlt}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Hover / focus zoom preview indicator */}
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-white/95 text-slate-800 shadow-md flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300">
                              <ZoomIn className="w-5 h-5" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>

      {/* Lightbox Modal with Zoom & Pan */}
      {lightboxIndex !== null && allImages.length > 0 && (
        <GalleryLightbox
          items={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
