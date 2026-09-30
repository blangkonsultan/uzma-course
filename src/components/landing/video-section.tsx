import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import type { VideosContent } from "@/types/landing";

export interface VideoSectionProps {
  data?: VideosContent;
}

export function VideoSection({ data }: VideoSectionProps) {
  const content = data || DEFAULT_LANDING_CONTENT.videos;

  if (!content.items || content.items.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-50">
      <Container className="max-w-4xl">
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="grid md:grid-cols-2 gap-8 mt-12 items-start justify-center">
          {content.items.map((video) => {
            const isTikTok =
              video.source === "tiktok" || video.embedUrl.includes("tiktok.com");

            return (
              <div
                key={video.id}
                className={`flex flex-col items-center w-full ${
                  isTikTok ? "max-w-[340px] mx-auto" : "max-w-xl mx-auto"
                }`}
              >
                <div
                  className={`w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-black ${
                    isTikTok ? "aspect-[9/16]" : "aspect-video"
                  }`}
                >
                  <iframe
                    src={video.embedUrl}
                    loading="lazy"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="w-full h-full border-0"
                    title={video.title}
                  />
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-3.5 text-center leading-snug">
                  {video.title}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
