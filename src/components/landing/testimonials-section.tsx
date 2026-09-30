"use client";

import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import type { TestimonialsContent } from "@/types/landing";

export interface TestimonialsSectionProps {
  data?: TestimonialsContent;
}

export function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const content = data || DEFAULT_LANDING_CONTENT.testimonials;

  return (
    <section id="testimoni" className="py-20 bg-white scroll-mt-16">
      <Container>
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="overflow-x-auto snap-x snap-mandatory flex gap-6 pb-6 pt-2 mt-12 scrollbar-thin">
          {content.items.map((item, idx) => (
            <Card
              key={`${item.parentName}-${idx}`}
              className="min-w-[300px] md:min-w-[350px] max-w-[380px] flex-shrink-0 snap-center flex flex-col justify-between"
            >
              <CardBody className="p-6 flex flex-col justify-between h-full">
                <div>
                  <Quote className="w-8 h-8 text-primary-300 mb-3" aria-hidden="true" />
                  <p className="text-slate-600 italic text-sm leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
                <div className="border-t border-slate-100 mt-6 pt-4">
                  <p className="font-semibold text-slate-800 text-sm">
                    {item.parentName}
                  </p>
                  <p className="text-xs font-medium text-primary-700 mt-0.5">
                    {item.programLabel}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
