import { Award, Clock, UserCheck, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardBody } from "@/components/ui/card";

const ADVANTAGES = [
  {
    icon: Award,
    title: "Metode AHE Teruji",
    description:
      "Menggunakan metode AHE yang telah terbukti efektif untuk anak usia dini.",
  },
  {
    icon: Users,
    title: "Guru Berpengalaman",
    description:
      "Pengajar terlatih dan bersertifikat dengan pengalaman mengajar anak.",
  },
  {
    icon: UserCheck,
    title: "Kelas Kecil & Personal",
    description:
      "Maksimal 5 anak per kelas untuk perhatian lebih personal.",
  },
  {
    icon: Clock,
    title: "Jadwal Fleksibel",
    description:
      "Pilihan jadwal yang bisa disesuaikan dengan aktivitas anak.",
  },
] as const;

export function WhyUsSection() {
  return (
    <section id="keunggulan" className="py-20 bg-slate-50 scroll-mt-16">
      <Container>
        <SectionHeading
          title="Mengapa Uzma Course?"
          subtitle="Komitmen kami mendampingi putra-putri Anda belajar dengan nyaman, percaya diri, dan berprestasi"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {ADVANTAGES.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="hover:shadow-lg transition-shadow duration-300">
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
