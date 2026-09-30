import Image from "next/image";
import { Award, Heart, Sparkles, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";
import { FOUNDER, TAGLINE } from "@/lib/constants";

export function TeamSection() {
  return (
    <section id="pengelola" className="py-20 bg-white scroll-mt-16">
      <Container>
        <SectionHeading
          title="Pengelola & Tenaga Pendidik"
          subtitle="Didukung pengajar berdedikasi, tersertifikasi, dan penuh kasih mendampingi buah hati Anda"
        />

        <div className="grid lg:grid-cols-12 gap-8 items-center mt-12">
          {/* Team Photo Card */}
          <div className="lg:col-span-7">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/team.jpg"
                  alt="Tim Pengajar Ahe SumoWangi"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
              <CardBody className="p-6 bg-slate-900 text-white">
                <div className="flex items-center gap-2 text-primary-300 text-xs font-semibold uppercase tracking-wider">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  <span>Tenaga Pengajar Berlisensi</span>
                </div>
                <h3 className="text-xl font-bold mt-1 text-white">
                  Tim Pendidik Ramah & Berpengalaman
                </h3>
                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  Pengajar melalui seleksi ketat dan pelatihan berkesinambungan untuk memastikan pendekatan belajar selalu sabar, suportif, dan menyenangkan bagi anak.
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Founder Profile & Values */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{TAGLINE}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                {FOUNDER.name}
              </h3>
              <p className="text-sm font-medium text-primary-700 mt-1">
                {FOUNDER.role}
              </p>
              <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                &ldquo;{FOUNDER.bio}&rdquo;
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-pink-100 text-accent flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Tanpa Trauma</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Pendekatan belajar bebas tekanan dan menyenangkan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Sejak 2022</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Telah meluluskan ratusan murid cerdas dan mandiri.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Collage */}
        <div className="mt-16">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-md border border-slate-200">
            <Image
              src="/images/gallery-grid.jpg"
              alt="Galeri Kegiatan Belajar dan Wisuda Ahe SumoWangi"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1200px"
            />
          </div>
          <p className="text-center text-xs text-slate-500 mt-3 italic">
            Dokumentasi keceriaan belajar, pendampingan personal, dan momen wisuda kelulusan di Ahe SumoWangi.
          </p>
        </div>
      </Container>
    </section>
  );
}
