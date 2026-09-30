import type { LucideIcon } from "lucide-react";
import { BookOpen, Globe, GraduationCap, MessageCircle } from "lucide-react";
import { PROGRAMS } from "@/lib/constants";
import { buildWaLink } from "@/lib/whatsapp";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Globe,
  GraduationCap,
};

export function ProgramsSection() {
  return (
    <section id="programs" className="py-20 bg-white scroll-mt-16">
      <Container>
        <SectionHeading
          title="Program Kami"
          subtitle="Pilihan bimbingan belajar berkualitas yang disesuaikan dengan tahap tumbuh kembang anak"
        />

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {PROGRAMS.map((program) => {
            const Icon = ICON_MAP[program.icon] || BookOpen;

            return (
              <Card
                key={program.id}
                className="hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
              >
                <CardBody className="flex flex-col h-full justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 mb-6">
                      <Icon className="w-8 h-8" aria-hidden="true" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="primary">{program.ageRange}</Badge>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mt-2">
                      {program.name}
                    </h3>
                    <p className="text-sm italic text-primary-700 mt-1 font-medium">
                      {program.tagline}
                    </p>
                    <p className="text-slate-600 mt-4 text-sm leading-relaxed">
                      {program.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <a
                      href={buildWaLink("program " + program.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
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
