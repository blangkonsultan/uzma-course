import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import { normalizeImageUrl } from "@/lib/utils";
import type { GalleryContent } from "@/types/landing";

export interface GallerySectionProps {
  data?: GalleryContent;
}

export function GallerySection({ data }: GallerySectionProps) {
  const content = data || DEFAULT_LANDING_CONTENT.gallery;
  const groupsWithImages = (content.groups || []).filter(
    (g) => g.images && g.images.length > 0
  );

  return (
    <section id="galeri" className="py-20 bg-slate-50 scroll-mt-16">
      <Container>
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        {groupsWithImages.length > 0 && (
          <div className="mt-12 space-y-12">
            {groupsWithImages.map((group, groupIdx) => (
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
                  {group.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 shadow-2xs group"
                    >
                      {/* Native img avoids Next.js remotePatterns restriction for arbitrary CMS URLs */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={normalizeImageUrl(img.url)}
                        alt={img.alt || `${group.label} - Foto ${i + 1}`}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
