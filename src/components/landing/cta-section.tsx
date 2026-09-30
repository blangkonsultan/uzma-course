import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { buildWaLink } from "@/lib/whatsapp";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import type { CTAContent } from "@/types/landing";

export interface CTASectionProps {
  data?: CTAContent;
}

export function CTASection({ data }: CTASectionProps) {
  const content = data || DEFAULT_LANDING_CONTENT.cta;

  return (
    <section className="bg-gradient-to-r from-primary-700 to-primary-600 py-20 text-white">
      <Container className="max-w-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
          {content.title}
        </h2>
        <p className="text-primary-100 mt-4 text-lg">
          {content.subtitle}
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            href={buildWaLink()}
            size="lg"
            className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg hover:shadow-xl text-lg font-semibold inline-flex items-center gap-3 px-8 py-4"
          >
            <MessageCircle className="w-6 h-6 text-primary-600" aria-hidden="true" />
            <span>{content.buttonText}</span>
          </Button>
        </div>
      </Container>
    </section>
  );
}
