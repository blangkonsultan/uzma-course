"use client";

import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { useId, useRef, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import type { GuideScreenshot } from "@/types/guides";

export interface GuideFigureProps {
  src: GuideScreenshot["src"];
  width: number;
  height: number;
  alt: string;
  caption: string;
}

export function GuideFigure({ src, width, height, alt, caption }: GuideFigureProps): ReactElement {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  return (
    <figure className="min-w-0 space-y-2.5">
      <button
        ref={opener}
        type="button"
        aria-haspopup="dialog"
        aria-label={`Perbesar screenshot: ${alt}`}
        onClick={() => dialog.current?.showModal()}
        className="block min-h-11 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left hover:border-primary-400 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
      >
        <Image src={src} width={width} height={height} alt={alt} unoptimized className="h-auto w-full" />
        <span data-guide-screen-only className="flex min-h-11 items-center justify-between gap-3 bg-white px-3 py-2 text-xs font-medium text-primary-800">
          Perbesar screenshot
          <Maximize2 aria-hidden="true" className="h-4 w-4 shrink-0" />
        </span>
      </button>
      <figcaption className="text-xs leading-relaxed text-slate-600">
        <span className="mr-2 inline-block rounded-full bg-primary-50 px-2 py-0.5 font-medium text-primary-800">Data demo</span>
        {caption}
      </figcaption>
      <dialog
        ref={dialog}
        data-guide-screen-only
        aria-labelledby={titleId}
        onClose={() => {
          if (opener.current && document.activeElement !== opener.current) opener.current.focus({ preventScroll: true });
        }}
        className="fixed inset-0 m-auto max-h-[94dvh] w-[calc(100vw-2rem)] max-w-6xl overflow-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-xl backdrop:bg-slate-900/70"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3">
          <h3 id={titleId} className="min-w-0 text-sm font-semibold leading-relaxed">{alt}</h3>
          <Button type="button" variant="ghost" size="sm" aria-label="Tutup screenshot" onClick={() => dialog.current?.close()} className="h-11 w-11 shrink-0 p-0">
            <X aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
        <div className="min-w-0 p-2 sm:p-4">
          <Image src={src} width={width} height={height} alt={alt} unoptimized className="mx-auto h-auto max-w-full" />
        </div>
      </dialog>
    </figure>
  );
}
