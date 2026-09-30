import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BRANCHES, WA_NUMBER } from "@/lib/constants";
import { buildWaLink } from "@/lib/whatsapp";

const FOOTER_LINKS = [
  { label: "Program", href: "#programs" },
  { label: "Keunggulan", href: "#keunggulan" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Lokasi", href: "#lokasi" },
  { label: "FAQ", href: "#faq" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
      <Container>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div>
            <span className="text-white font-bold text-2xl tracking-tight">
              Uzma Course
            </span>
            <p className="text-sm mt-3 text-slate-400 leading-relaxed">
              Bimbingan belajar terbaik untuk anak Anda. Menumbuhkan minat belajar, kemandirian, dan prestasi sejak dini.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">
              Menu Navigasi
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block text-sm text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Cabang Balongbendo */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">
              Cabang Balongbendo
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {BRANCHES.find((b) => b.id === "balongbendo")?.address || "Sumokembangsri, Balongbendo, Sidoarjo"}
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${WA_NUMBER}`}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                <Phone className="w-4 h-4 text-primary-400" aria-hidden="true" />
                <span>085708110736</span>
              </a>
              <div>
                <a
                  href={buildWaLink("Cabang Balongbendo")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <div>
                <a
                  href={BRANCHES.find((b) => b.id === "balongbendo")?.gmapsUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <MapPin className="w-4 h-4 text-primary-400" aria-hidden="true" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Cabang Krian */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">
              Cabang Krian
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {BRANCHES.find((b) => b.id === "krian")?.address || "Junwangi, Krian, Sidoarjo"}
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${WA_NUMBER}`}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                <Phone className="w-4 h-4 text-primary-400" aria-hidden="true" />
                <span>085708110736</span>
              </a>
              <div>
                <a
                  href={buildWaLink("Cabang Krian")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <div>
                <a
                  href={BRANCHES.find((b) => b.id === "krian")?.gmapsUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <MapPin className="w-4 h-4 text-primary-400" aria-hidden="true" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          <p>© {currentYear} Uzma Course. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
