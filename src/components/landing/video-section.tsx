import { PROMO_VIDEOS } from "@/lib/constants";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function VideoSection() {
  if (PROMO_VIDEOS.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-50">
      <Container className="max-w-4xl">
        <SectionHeading
          title="Video Kegiatan Kami"
          subtitle="Suasana belajar yang ceria, interaktif, dan penuh semangat di Uzma Course"
        />

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {PROMO_VIDEOS.map((video) => (
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
