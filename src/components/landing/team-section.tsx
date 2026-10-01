import type { LucideIcon } from "lucide-react";
import {
  Award,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import type { TeamContent } from "@/types/landing";
import { normalizeImageUrl } from "@/lib/utils";
import { FounderPhoto } from "./founder-photo";

const VALUE_ICONS: Record<string, LucideIcon> = {
  Heart,
  Award,
  Sparkles,
  Users,
  ShieldCheck,
  Star,
};

export interface TeamSectionProps {
  data?: TeamContent;
}

export function TeamSection({ data }: TeamSectionProps) {
  const content = data || DEFAULT_LANDING_CONTENT.team;

  return (
    <section id="pengelola" className="py-20 bg-white scroll-mt-16">
      <Container>
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="grid lg:grid-cols-12 gap-8 items-center mt-12">
          {/* Team Photo Card */}
          <div className="lg:col-span-7">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                {/* Native img avoids Next.js remotePatterns restriction for arbitrary CMS URLs */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizeImageUrl(content.teamPhotoUrl)}
                  alt={content.teamPhotoAlt || "Tim Pengajar Ahe SumoWangi"}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <CardBody className="p-6 bg-slate-900 text-white">
                <div className="flex items-center gap-2 text-primary-300 text-xs font-semibold uppercase tracking-wider">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  <span>{content.teamBadge}</span>
                </div>
                <h3 className="text-xl font-bold mt-1 text-white">
                  {content.teamHeading}
                </h3>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  {content.teamDescription}
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Founder Profile & Values */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-primary-50/80 rounded-2xl p-5 sm:p-6 border border-primary-100 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-primary-200/80 shadow-md bg-white ring-2 ring-primary-100/60 ring-offset-2 ring-offset-primary-50">
                  <FounderPhoto
                    src={content.founderPhotoUrl}
                    alt={content.founderPhotoAlt || `Foto ${content.founderName}`}
                    fallbackSrc="/images/founder-fallback.webp"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary-600 shrink-0" aria-hidden="true" />
                    <span>Pengelola & Penanggung Jawab</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 font-heading leading-snug">
                    {content.founderName}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-primary-700 mt-1">
                    {content.founderRole}
                  </p>
                </div>
              </div>

              <blockquote className="mt-4 pt-3.5 border-t border-primary-100 text-slate-600 text-xs sm:text-sm leading-relaxed italic">
                &ldquo;{content.founderQuote}&rdquo;
              </blockquote>
            </div>

            {/* Dynamic Values Cards */}
            {content.values && content.values.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {content.values.map((val, idx) => {
                  const Icon = VALUE_ICONS[val.icon] || Heart;
                  const isPink = idx % 2 === 0;

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isPink
                            ? "bg-pink-100 text-accent"
                            : "bg-purple-100 text-primary-700"
                        }`}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {val.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {val.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </Container>
    </section>
  );
}
