"use client";

import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";

const TESTIMONIALS = [
  {
    quote:
      "Alhamdulillah anak saya sekarang sudah lancar membaca dan berhitung sebelum masuk SD. Gurunya sangat sabar dan metodenya menyenangkan.",
    parentName: "Ibu Rahma",
    programLabel: "Orang Tua Murid AHE",
  },
  {
    quote:
      "Kemampuan bahasa Inggris anak saya meningkat pesat. Sekarang lebih percaya diri berbicara dan kosakatanya makin kaya.",
    parentName: "Bapak Dimas",
    programLabel: "Orang Tua Murid BEE",
  },
  {
    quote:
      "Nilai matematika dan IPA anak saya di SMP meningkat drastis setelah rutin les di Uzma Course. Pendampingannya sangat fokus.",
    parentName: "Ibu Siti",
    programLabel: "Orang Tua Murid Bimbel SMP",
  },
  {
    quote:
      "Anak saya selalu bersemangat tiap jadwal les. Pengajarnya ramah dan pendekatannya sangat personal untuk tiap anak.",
    parentName: "Ibu Fitri",
    programLabel: "Orang Tua Murid AHE & BEE",
  },
] as const;

export function TestimonialsSection() {
  return (
    <section id="testimoni" className="py-20 bg-white scroll-mt-16">
      <Container>
        <SectionHeading
          title="Kata Orang Tua Murid"
          subtitle="Pengalaman dan kepuasan para orang tua yang mempercayakan pendidikan putra-putrinya di Uzma Course"
        />

        <div className="overflow-x-auto snap-x snap-mandatory flex gap-6 pb-6 pt-2 mt-12 scrollbar-thin">
          {TESTIMONIALS.map((item) => (
            <Card
              key={item.parentName}
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
