"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWaLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import type { NavbarContent } from "@/types/landing";

export interface NavbarProps {
  data?: NavbarContent;
}

export function Navbar({ data }: NavbarProps) {
  const content = data || DEFAULT_LANDING_CONTENT.navbar;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <a
          href="#"
          className={cn(
            "flex items-center gap-2.5 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md",
            scrolled ? "text-primary-700" : "text-white"
          )}
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 bg-white shrink-0 shadow-xs p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-uzma-course.jpg"
              alt="Logo Uzma Course"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-heading">
            {content.brandName}
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {content.navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md px-1 py-0.5",
                scrolled
                  ? "text-slate-600 hover:text-primary-700"
                  : "text-white/90 hover:text-white"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Button
            href={buildWaLink()}
            size="sm"
            className={cn(
              scrolled
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : "bg-white text-primary-700 hover:bg-primary-50 shadow-md"
            )}
          >
            {content.ctaText}
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={cn(
            "md:hidden p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            scrolled
              ? "text-slate-700 hover:bg-slate-100"
              : "text-white hover:bg-white/10"
          )}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" aria-hidden="true" />
          ) : (
            <Menu className="w-6 h-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-4 pb-6 space-y-3 shadow-xl">
          <nav className="flex flex-col space-y-2">
            {content.navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-700 hover:text-primary-700 font-medium py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2">
            <Button
              href={buildWaLink()}
              size="md"
              className="w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              {content.ctaText}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
