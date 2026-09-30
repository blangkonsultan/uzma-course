import {
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import {
  BRANCHES,
  SOCIAL_LINKS,
  TAGLINE,
  WA_DISPLAY_NUMBER,
  WA_NUMBER,
} from "@/lib/constants";
import { buildWaLink } from "@/lib/whatsapp";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

const FOOTER_LINKS = [
  { label: "Program Belajar", href: "#programs" },
  { label: "Keunggulan", href: "#keunggulan" },
  { label: "Fasilitas", href: "#fasilitas" },
  { label: "Pengelola & Guru", href: "#pengelola" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Lokasi Cabang", href: "#lokasi" },
  { label: "FAQ", href: "#faq" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
      <Container>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Socials */}
          <div>
            <span className="text-white font-bold text-2xl tracking-tight">
              Uzma Course
            </span>
            <p className="text-xs font-semibold text-primary-400 mt-1 uppercase tracking-wider">
              Ahe SumoWangi
            </p>
            <p className="text-sm mt-3 text-slate-400 leading-relaxed">
              &ldquo;{TAGLINE}&rdquo; — Bimbingan belajar di bawah naungan Ahe Indonesia sejak 2022. Ramah anak, ceria, dan berprestasi.
            </p>

            {/* Social Media Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Ahe SumoWangi"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Ahe SumoWangi"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
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
            <h3 className="text-white font-semibold text-base mb-1">
              Cabang Balongbendo
            </h3>
            <p className="text-xs text-primary-400 font-medium mb-3">
              Ahe Sumokembangsri
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {BRANCHES.find((b) => b.id === "balongbendo")?.address}
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${WA_NUMBER}`}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                <Phone className="w-4 h-4 text-primary-400" aria-hidden="true" />
                <span>{WA_DISPLAY_NUMBER}</span>
              </a>
              <div>
                <a
                  href={buildWaLink("Cabang Balongbendo")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp ({WA_DISPLAY_NUMBER})</span>
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
                  <span>Petunjuk Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Cabang Krian */}
          <div>
            <h3 className="text-white font-semibold text-base mb-1">
              Cabang Krian
            </h3>
            <p className="text-xs text-primary-400 font-medium mb-3">
              Ahe Junwangi
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {BRANCHES.find((b) => b.id === "krian")?.address}
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${WA_NUMBER}`}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                <Phone className="w-4 h-4 text-primary-400" aria-hidden="true" />
                <span>{WA_DISPLAY_NUMBER}</span>
              </a>
              <div>
                <a
                  href={buildWaLink("Cabang Krian")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp ({WA_DISPLAY_NUMBER})</span>
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
                  <span>Petunjuk Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          <p>© {currentYear} Uzma Course (Ahe SumoWangi). All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
