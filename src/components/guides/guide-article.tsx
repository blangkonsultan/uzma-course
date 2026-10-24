import { CheckCircle2, ChevronDown, Info, AlertTriangle } from "lucide-react";
import type { ReactElement } from "react";
import { GuideFigure } from "./guide-figure";
import type { GuideArticle } from "@/types/guides";

export interface GuideArticleContentProps {
  article: GuideArticle;
}

export function GuideArticleContent({ article }: GuideArticleContentProps): ReactElement {
  let nextStep = 1;

  return (
    <article id="guide-article" tabIndex={-1} aria-labelledby="guide-topic-title" className="@container min-w-0 scroll-mt-24 rounded-2xl text-sm leading-[1.85] text-slate-700 outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary-600 selection:bg-primary-100 selection:text-primary-950">
      <h2 id="guide-topic-title" className="text-2xl font-bold leading-tight tracking-tight text-slate-900">{article.title}</h2>
      <p className="mt-3 max-w-[72ch] text-sm leading-[1.85] text-slate-600">{article.summary}</p>

      <section className="mt-6 rounded-2xl bg-slate-50 p-4" aria-label="Sebelum mulai" data-guide-note>
        <h3 className="font-semibold text-slate-900">Sebelum mulai</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {article.prerequisites.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="mt-8" aria-label="Langkah-langkah">
        <h3 className="mb-5 text-base font-semibold text-slate-900">Langkah-langkah</h3>
        <div className="space-y-8">
          {article.groups.map((group) => {
            const start = nextStep;
            nextStep += group.steps.length;
            return (
              <section key={group.id} data-guide-step-group className="min-w-0">
                {group.warning ? (
                  <aside role="note" data-guide-note className="mb-5 flex gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900">
                    <AlertTriangle aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" />
                    <p>{group.warning}</p>
                  </aside>
                ) : null}
                <div className={group.screenshots.length ? "grid min-w-0 items-start gap-6 @xl:grid-cols-[minmax(0,1fr)_minmax(0,.9fr)]" : "min-w-0"}>
                  <ol start={start} className="list-decimal space-y-6 pl-5 marker:font-semibold marker:text-primary-800">
                    {group.steps.map((step, position) => (
                      <li key={`${group.id}-${position}`} className="min-w-0 pl-1" data-guide-step>
                        <h4 className="font-semibold text-slate-900">{step.title}</h4>
                        <div className="mt-2 space-y-2">
                          {step.paragraphs.map((paragraph) => <p key={paragraph} className="max-w-[72ch] break-words">{paragraph}</p>)}
                        </div>
                      </li>
                    ))}
                  </ol>
                  {group.screenshots.length ? (
                    <div className="min-w-0 space-y-5">
                      {group.screenshots.map((shot) => (
                        <GuideFigure key={shot.src} src={shot.src} width={shot.width} height={shot.height} alt={shot.alt} caption={shot.caption} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-emerald-50 p-4 text-emerald-900" data-guide-note>
        <h3 className="flex items-center gap-2 font-semibold"><CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" />Hasil yang diharapkan</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">{article.expected.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      {article.systemRules.length ? (
        <section className="mt-7 rounded-2xl bg-primary-50 p-4 text-primary-900" data-guide-note>
          <h3 className="flex items-center gap-2 font-semibold"><Info aria-hidden="true" className="h-4 w-4 shrink-0" />Aturan sistem</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">{article.systemRules.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ) : null}

      {article.recommendations.length ? (
        <section className="mt-7" data-guide-note>
          <h3 className="font-semibold text-slate-900">Saran penggunaan</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">{article.recommendations.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ) : null}

      {article.troubleshooting.length ? (
        <section className="mt-8" data-guide-troubleshooting>
          <h3 className="mb-2 text-base font-semibold text-slate-900">Jika mengalami kendala</h3>
          {article.troubleshooting.map((item) => (
            <details key={item.question} className="group border-b border-slate-200">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-slate-800 marker:content-none focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-primary-600">
                {item.question}<ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-primary-700 group-open:rotate-180" />
              </summary>
              <p className="max-w-[72ch] pb-4 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </section>
      ) : null}
    </article>
  );
}
