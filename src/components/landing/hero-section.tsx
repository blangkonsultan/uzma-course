import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { buildWaLink } from "@/lib/whatsapp";
import { TAGLINE } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary-700 via-primary-600 to-accent pt-28 pb-20 overflow-hidden">
      {/* Decorative blurred circles for subtle depth */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <Container className="relative z-10 text-center text-white max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-primary-100 text-xs md:text-sm font-semibold mb-6 border border-white/20">
          <Sparkles className="w-4 h-4 text-yellow-300" aria-hidden="true" />
          <span>{TAGLINE}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Bimbingan Belajar Terbaik & Ramah Anak
        </h1>
        <p className="text-lg md:text-xl mt-4 text-primary-100 font-semibold">
          Les Baca AHE Sumokembangsri & AHE Junwangi — Uzma Course
        </p>
        <p className="text-sm md:text-base mt-2 text-primary-200 max-w-2xl mx-auto leading-relaxed">
          Pusat bimbingan belajar calistung anak hebat di Sidoarjo. Melayani les baca AHE Sumokembangsri (Balongbendo) dan les baca AHE Junwangi (Krian) sejak 2022 dengan metode ceria tanpa trauma belajar.
        </p>

        <div className="mt-8 flex flex-wrap gap-2 justify-center text-xs text-white/90">
          <span className="px-3 py-1 rounded-full bg-white/10">✓ Les Baca Tulis AHE</span>
          <span className="px-3 py-1 rounded-full bg-white/10">✓ Hitung Dasar</span>
          <span className="px-3 py-1 rounded-full bg-white/10">✓ Brainy English</span>
          <span className="px-3 py-1 rounded-full bg-white/10">✓ Mapel SD</span>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 justify-center items-center">
          <Button
            href={buildWaLink()}
            size="lg"
            className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg"
          >
            Daftar Sekarang
          </Button>
          <Button
            variant="outline"
            href="#programs"
            size="lg"
          >
            Lihat Program
          </Button>
        </div>
      </Container>
    </section>
  );
}
