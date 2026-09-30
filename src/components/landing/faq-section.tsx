"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import type { FAQContent } from "@/types/landing";

export interface FAQSectionProps {
  data?: FAQContent;
}

export function FAQSection({ data }: FAQSectionProps) {
  const content = data || DEFAULT_LANDING_CONTENT.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 scroll-mt-16">
      <Container className="max-w-3xl">
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="mt-12 space-y-4">
          {content.items.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-btn-${faq.id}-${index}`;
            const panelId = `faq-panel-${faq.id}-${index}`;

            return (
              <div
                key={`${faq.id}-${index}`}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-5 text-left font-semibold text-slate-800 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180 text-primary-600"
                    )}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isOpen
                      ? "max-h-48 opacity-100 p-5 pt-0 text-slate-600 text-sm leading-relaxed"
                      : "max-h-0 opacity-0 p-0"
                  )}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
