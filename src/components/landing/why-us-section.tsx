import type { LucideIcon } from "lucide-react";
import {
  Award,
  Clock,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import type { WhyUsContent } from "@/types/landing";

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Users,
  UserCheck,
  Clock,
  Heart,
  Sparkles,
  ShieldCheck,
  Star,
};

export interface WhyUsSectionProps {
  data?: WhyUsContent;
}

export function WhyUsSection({ data }: WhyUsSectionProps) {
  const content = data || DEFAULT_LANDING_CONTENT.why_us;

  return (
    <section id="keunggulan" className="py-20 bg-slate-50 scroll-mt-16">
      <Container>
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {content.items.map((item) => {
            const Icon = ICON_MAP[item.icon] || Award;
            return (
              <Card
                key={item.title}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardBody className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
