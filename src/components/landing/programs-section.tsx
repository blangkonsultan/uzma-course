import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  MessageCircle,
  Users,
} from "lucide-react";
import { PROGRAMS } from "@/lib/constants";
import { buildWaLink } from "@/lib/whatsapp";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Calculator,
  Globe,
  GraduationCap,
};

export function ProgramsSection() {
  return (
    <section id="programs" className="py-20 bg-white scroll-mt-16">
      <Container>
        <SectionHeading
          title="Program Belajar Unggulan"
          subtitle="Sistem belajar intensif dengan rasio murid kecil untuk hasil optimal dan anak senang belajar"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {PROGRAMS.map((program) => {
            const Icon = ICON_MAP[program.icon] || BookOpen;

            return (
              <Card
                key={program.id}
                className="hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <CardBody className="p-6 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700">
                        <Icon className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <Badge variant="primary">{program.ageRange}</Badge>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 leading-snug">
                      {program.name}
                    </h3>
                    <p className="text-xs italic text-primary-700 mt-1 font-medium">
                      {program.tagline}
                    </p>
                    <p className="text-slate-600 mt-3 text-xs leading-relaxed">
                      {program.description}
                    </p>

                    {/* Learning System Box */}
                    <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2 font-semibold text-primary-800">
                        <Users className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                        <span>{program.system}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        <span>{program.duration} · {program.frequency}</span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="mt-4 space-y-1.5">
                      {program.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-1.5 text-xs text-slate-600"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" aria-hidden="true" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <a
                      href={buildWaLink("program " + program.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 font-semibold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Tanya via WhatsApp</span>
                    </a>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
