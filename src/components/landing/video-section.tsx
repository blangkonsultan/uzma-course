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

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {content.items.map((video) => (
            <div key={video.id} className="flex flex-col">
              <iframe
                src={video.embedUrl}
                loading="lazy"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="aspect-video w-full rounded-xl shadow-md border-0"
                title={video.title}
              />
              <p className="text-sm font-medium text-slate-700 mt-3 text-center">
                {video.title}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
