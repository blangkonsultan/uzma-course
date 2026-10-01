import {
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { buildWaLink } from "@/lib/whatsapp";
import { DEFAULT_LANDING_CONTENT, normalizeSocialLinks } from "@/lib/landing-content";
import type { FooterContent, LocationsContent, SocialMediaItem } from "@/types/landing";
import { SocialIcon, getSocialPlatformConfig } from "@/components/ui/social-icon";


export interface FooterProps {
  data?: FooterContent;
  locationsData?: LocationsContent;
}

export function Footer({ data, locationsData }: FooterProps) {
  const content = data || DEFAULT_LANDING_CONTENT.footer;
  const locations = locationsData || DEFAULT_LANDING_CONTENT.locations;
  const currentYear = new Date().getFullYear();

  const balongbendo = locations.items.find((b) => b.id === "balongbendo");
  const krian = locations.items.find((b) => b.id === "krian");

  const socialItems: SocialMediaItem[] = Array.isArray(content.socialLinks)
    ? content.socialLinks
    : normalizeSocialLinks(content.socialLinks);
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
              &ldquo;{content.tagline}&rdquo; — Bimbingan belajar di bawah naungan Ahe Indonesia sejak 2022. Ramah anak, ceria, dan berprestasi.
            </p>

            {/* Social Media Links */}
            {socialItems.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                {socialItems.map((item, idx) => {
                  const config = getSocialPlatformConfig(item.platform);
                  const displayLabel = item.label || config.label;

                  return (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={displayLabel}
                      title={displayLabel}
                      className={`w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:scale-105 shadow-2xs ${config.hoverClass}`}
                    >
                      <SocialIcon platform={item.platform} className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4">
              Menu Navigasi
            </h3>
            <ul className="space-y-2">
              {content.navLinks.map((link) => (
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
              {balongbendo ? balongbendo.name : "Cabang Balongbendo"}
            </h3>
            <p className="text-xs text-primary-400 font-medium mb-3">
              {balongbendo ? balongbendo.subName : "Ahe Sumokembangsri"}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {balongbendo?.address}
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${content.contactPhone}`}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                <Phone className="w-4 h-4 text-primary-400" aria-hidden="true" />
                <span>{content.contactWaDisplay}</span>
              </a>
              <div>
                <a
                  href={buildWaLink("Cabang Balongbendo")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp ({content.contactWaDisplay})</span>
                </a>
              </div>
              {balongbendo?.gmapsUrl && (
                <div>
                  <a
                    href={balongbendo.gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                  >
                    <MapPin className="w-4 h-4 text-primary-400" aria-hidden="true" />
                    <span>Petunjuk Google Maps</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Col 4: Cabang Krian */}
          <div>
            <h3 className="text-white font-semibold text-base mb-1">
              {krian ? krian.name : "Cabang Krian"}
            </h3>
            <p className="text-xs text-primary-400 font-medium mb-3">
              {krian ? krian.subName : "Ahe Junwangi"}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {krian?.address}
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${content.contactPhone}`}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                <Phone className="w-4 h-4 text-primary-400" aria-hidden="true" />
                <span>{content.contactWaDisplay}</span>
              </a>
              <div>
                <a
                  href={buildWaLink("Cabang Krian")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp ({content.contactWaDisplay})</span>
                </a>
              </div>
              {krian?.gmapsUrl && (
                <div>
                  <a
                    href={krian.gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                  >
                    <MapPin className="w-4 h-4 text-primary-400" aria-hidden="true" />
                    <span>Petunjuk Google Maps</span>
                  </a>
                </div>
              )}
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
