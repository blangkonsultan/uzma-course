"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    id: "faq-daftar",
    question: "Bagaimana cara mendaftar?",
    answer:
      "Hubungi kami via WhatsApp untuk konsultasi awal dan penjadwalan. Tim kami akan membantu memilih program yang paling sesuai dengan kebutuhan anak Anda.",
  },
  {
    id: "faq-biaya",
    question: "Berapa biaya per bulan?",
    answer:
      "Biaya bervariasi per program dan cabang. Hubungi kami via WhatsApp untuk informasi rincian biaya dan promo yang sedang berlangsung.",
  },
  {
    id: "faq-trial",
    question: "Apakah ada kelas percobaan?",
    answer:
      "Ya, kami menyediakan satu sesi percobaan gratis untuk setiap program agar anak dapat merasakan langsung suasana belajar di Uzma Course.",
  },
  {
    id: "faq-jumlah",
    question: "Berapa jumlah murid per kelas?",
    answer:
      "Maksimal 5 anak per kelas untuk pembelajaran yang lebih personal, fokus, dan efektif bagi setiap murid.",
  },
  {
    id: "faq-lokasi",
    question: "Di mana lokasi les baca AHE Sumokembangsri dan AHE Junwangi?",
    answer:
      "Uzma Course memiliki dua unit resmi di Sidoarjo: Unit les baca AHE Sumokembangsri (Sumotuwo, Balongbendo) dan unit les baca AHE Junwangi (Junwatu, Krian). Keduanya dilengkapi fasilitas belajar ramah anak dan guru berlisensi.",
  },
  {
    id: "faq-usia",
    question: "Kapan anak bisa mulai les baca AHE di Sumokembangsri atau Junwangi?",
    answer:
      "Anak dapat mulai belajar les baca tulis AHE sejak usia 3,5 tahun. Metode AHE dirancang bertahap tanpa mengeja dan tanpa beban hafalan sehingga anak belajar dengan ceria tanpa rasa takut.",
  },
  {
    id: "faq-jumlah",
    question: "Berapa jumlah murid per sesi belajar?",
    answer:
      "Sistem pembelajaran sangat privat dan personal: Les Baca AHE maksimal 2 anak per guru, Hitung Dasar maksimal 4 anak, BEE maksimal 2 anak, dan Bimbel Mapel 1 anak 1 guru (private).",
  },
] as const;

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 scroll-mt-16">
      <Container className="max-w-3xl">
        <SectionHeading
          title="Pertanyaan Umum"
          subtitle="Jawaban atas pertanyaan yang sering diajukan mengenai program dan kegiatan belajar di Uzma Course"
        />

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-btn-${faq.id}`;
            const panelId = `faq-panel-${faq.id}`;

            return (
              <div
                key={faq.id}
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
                      "w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-200",
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
