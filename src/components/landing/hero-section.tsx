import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { buildWaLink } from "@/lib/whatsapp";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-primary-700 via-primary-600 to-accent pt-24 pb-16 overflow-hidden">
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
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Bimbingan Belajar Terbaik untuk Anak Anda
        </h1>
        <p className="text-lg md:text-xl mt-6 text-primary-100 font-medium">
          Calistung · Bahasa Inggris · Bimbel SD–SMP
        </p>
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
