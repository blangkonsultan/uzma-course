import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  Award,
  BadgePercent,
  Gamepad2,
  Home,
  Sparkles,
  Trophy,
  Wifi,
} from "lucide-react";
import { FACILITIES } from "@/lib/constants";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Home,
  Trophy,
  Armchair,
  Wifi,
  Gamepad2,
  BadgePercent,
  Sparkles,
};

export function FacilitiesSection() {
  return (
    <section id="fasilitas" className="py-20 bg-slate-50 scroll-mt-16">
      <Container>
        <SectionHeading
          title="Fasilitas Ahe SumoWangi"
          subtitle="Kenyamanan dan sarana lengkap untuk mendukung proses belajar yang ceria, aman, dan kondusif"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {FACILITIES.map((facility) => {
            const Icon = ICON_MAP[facility.icon] || Sparkles;

            return (
              <Card
                key={facility.title}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <CardBody className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 mb-4">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {facility.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {facility.description}
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
