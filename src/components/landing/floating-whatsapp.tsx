"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { buildWaLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import type { FloatingWaContent } from "@/types/landing";

export interface FloatingWhatsAppProps {
  data?: FloatingWaContent;
}

export function FloatingWhatsApp({ data }: FloatingWhatsAppProps) {
  const content = data ?? DEFAULT_LANDING_CONTENT.floating_wa;
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!content.isEnabled) {
    return null;
  }

  return (
    <aside
      aria-label="Kontak WhatsApp Cepat"
      className="fixed bottom-6 right-6 z-50"
    >
      <a
        href={buildWaLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat via WhatsApp"
        className={cn(
          "w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2",
          animate && "animate-bounce"
        )}
      >
        <MessageCircle className="w-7 h-7" aria-hidden="true" />
      </a>
    </aside>
  );
}
