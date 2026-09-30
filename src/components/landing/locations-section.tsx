import { ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { BRANCHES } from "@/lib/constants";
import { buildWaLink } from "@/lib/whatsapp";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";

export function LocationsSection() {
  return (
    <section id="lokasi" className="py-20 bg-slate-50 scroll-mt-16">
      <Container className="max-w-5xl">
        <SectionHeading
          title="Lokasi Kami"
          subtitle="Kunjungi cabang Uzma Course terdekat di area Sidoarjo untuk konsultasi langsung"
        />

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {BRANCHES.map((branch) => (
            <Card key={branch.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardBody className="p-8 flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                    <MapPin className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {branch.name}
                  </h3>
                  <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                    {branch.address}
                  </p>

                  <div className="mt-4">
                    {branch.mapUrl ? (
                      <iframe
                        src={branch.mapUrl}
                        loading="lazy"
                        className="aspect-video w-full rounded-xl border border-slate-200"
                        allowFullScreen
                        title={`Peta ${branch.name}`}
                      />
                    ) : (
                      <div className="aspect-video w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-medium border border-dashed border-slate-300">
                        Peta segera hadir
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={buildWaLink("lokasi " + branch.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Tanya via WhatsApp</span>
                  </a>

                  {branch.gmapsUrl && (
                    <a
                      href={branch.gmapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-600 hover:text-primary-700 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-2.5 py-1.5 bg-slate-50 hover:bg-primary-50"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Buka Google Maps</span>
                    </a>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
