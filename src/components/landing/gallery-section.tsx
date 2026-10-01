"use client";

import { useState, useMemo } from "react";
import { ZoomIn, Images, ChevronDown, ChevronUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import { cn, normalizeImageUrl } from "@/lib/utils";
import type { GalleryContent } from "@/types/landing";
import {
  GalleryLightbox,
  type LightboxImageItem,
} from "@/components/landing/gallery-lightbox";

export interface GallerySectionProps {
  data?: GalleryContent;
}

const DEFAULT_CAP = 4;

export function GallerySection({ data }: GallerySectionProps) {
  const content = data || DEFAULT_LANDING_CONTENT.gallery;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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

  // Filter groups according to active category tab
  const displayedGroups = useMemo(() => {
    if (activeCategory === "all") return groupsWithImages;
    return groupsWithImages.filter((g) => g.label === activeCategory);
  }, [groupsWithImages, activeCategory]);

  const totalPhotosCount = useMemo(
    () => groupsWithImages.reduce((sum, g) => sum + g.images.length, 0),
    [groupsWithImages]
  );

  const toggleExpandGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  return (
    <section id="galeri" className="py-20 bg-slate-50 scroll-mt-16">
      <Container>
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        {/* Category Filter Tabs */}
        {groupsWithImages.length > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-x-auto max-w-full scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center justify-center",
                  activeCategory === "all"
                    ? "bg-primary-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                Semua ({totalPhotosCount})
              </button>
              {groupsWithImages.map((group, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveCategory(group.label)}
                  className={cn(
                    "min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center justify-center",
                    activeCategory === group.label
                      ? "bg-primary-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {group.label} ({group.images.length})
                </button>
              ))}
            </div>
          </div>
        )}

        {displayedGroups.length > 0 && (
          <div className="mt-12 space-y-12">
            {displayedGroups.map((group) => {
              // Find group's original index in groupsWithImages to get correct offset
              const originalGroupIdx = groupsWithImages.findIndex(
                (g) => g.label === group.label
              );
              const startIdx = groupOffsets[originalGroupIdx] ?? 0;

              const isExpanded = Boolean(expandedGroups[group.label]);
              const hasMore = group.images.length > DEFAULT_CAP;
              const visibleImages =
                isExpanded || !hasMore
                  ? group.images
                  : group.images.slice(0, DEFAULT_CAP);

              // Calculate count of remaining images behind the 4th card
              const remainingCount = group.images.length - (DEFAULT_CAP - 1);

              return (
                <div key={group.label} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-800 tracking-tight">
                      {group.label}
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                      {group.images.length} Foto
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Image Grid (4 columns on desktop, 2 on mobile) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {visibleImages.map((img, i) => {
                      const globalIdx = startIdx + i;
                      const imageAlt =
                        img.alt || `${group.label} - Foto ${i + 1}`;

                      // When collapsed and this is the 4th card: show +N overlay
                      const isOverflowCard =
                        !isExpanded && hasMore && i === DEFAULT_CAP - 1;

                      if (isOverflowCard) {
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLightboxIndex(globalIdx)}
                            className="group relative aspect-square w-full rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-2xs hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-all cursor-pointer text-left p-0"
                            aria-label={`Buka galeri lengkap ${group.label}: sisa ${remainingCount} foto lagi`}
                          >
                            {/* Underlying photo with dark filter */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={normalizeImageUrl(img.url)}
                              alt={imageAlt}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4] transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Prominent +N overlay */}
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center transition-colors group-hover:bg-slate-950/50">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 text-white border border-white/25 flex items-center justify-center mb-1.5 shadow-sm transform group-hover:scale-110 transition-transform">
                                <Images className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <span className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight leading-none">
                                +{remainingCount}
                              </span>
                              <span className="text-[11px] sm:text-xs font-semibold text-slate-200 mt-1">
                                Foto Lainnya
                              </span>
                              <span className="text-[10px] text-slate-300/80 mt-0.5 hidden sm:block">
                                Klik untuk melihat
                              </span>
                            </div>
                          </button>
                        );
                      }

                      // Regular clickable photo card
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setLightboxIndex(globalIdx)}
                          className="group relative aspect-square w-full rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-2xs hover:shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-all cursor-pointer text-left p-0"
                          aria-label={`Buka foto: ${imageAlt}`}
                        >
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

                  {/* In-place Expand / Collapse Toggle Button */}
                  {hasMore && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => toggleExpandGroup(group.label)}
                        className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50/50 text-xs sm:text-sm font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                            <span>Tampilkan Lebih Sedikit</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                            <span>
                              Lihat Semua {group.images.length} Foto {group.label}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
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
