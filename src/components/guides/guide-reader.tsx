import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactElement } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { GuideArticleContent } from "./guide-article";
import { GuidePrintButton } from "./guide-print-button";
import { GuideShell } from "./guide-shell";
import { resolveGuideArticle } from "@/lib/guides/navigation";
import type { GuideDefinition, GuideIndexItem } from "@/types/guides";

export interface GuideReaderProps {
  guide: GuideDefinition;
  index: readonly GuideIndexItem[];
  topic: string | string[] | undefined;
}

export function GuideReader({ guide, index, topic }: GuideReaderProps): ReactElement {
  const article = resolveGuideArticle(guide, topic);
  const basePath = guide.role === "admin" ? "/admin/panduan" : "/guru/panduan";
  const position = index.findIndex((item) => item.slug === article.slug);
  const previous = position > 0 ? index[position - 1] : undefined;
  const next = position >= 0 ? index[position + 1] : undefined;

  return (
    <section data-guide-reader data-guide-print-container>
      <a href="#guide-article" className="sr-only z-50 rounded-full bg-primary-700 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4">Langsung ke panduan</a>
      <PageHeader title={guide.title} description={guide.description} action={<GuidePrintButton />} />
      <GuideShell role={guide.role} basePath={basePath} index={index} activeSlug={article.slug}>
        <GuideArticleContent article={article} />
        {previous || next ? (
          <nav data-guide-screen-only aria-label="Navigasi antar topik" className="mt-8 grid min-w-0 grid-cols-2 gap-3 border-t border-slate-200 pt-5">
            {previous ? (
              <Link prefetch={false} href={`${basePath}?topik=${encodeURIComponent(previous.slug)}#guide-article`} className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-primary-600">
                <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words"><span className="block text-xs text-slate-500">Sebelumnya</span>{previous.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link prefetch={false} href={`${basePath}?topik=${encodeURIComponent(next.slug)}#guide-article`} className="flex min-h-11 min-w-0 items-center justify-end gap-2 rounded-xl bg-slate-50 p-3 text-right text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-primary-600">
                <span className="min-w-0 break-words"><span className="block text-xs text-slate-500">Selanjutnya</span>{next.title}</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              </Link>
            ) : null}
          </nav>
        ) : null}
      </GuideShell>
    </section>
  );
}
