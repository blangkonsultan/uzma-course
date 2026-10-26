"use client";

import { Printer } from "lucide-react";
import { useEffect, type ReactElement } from "react";
import { Button } from "@/components/ui/button";

export function GuidePrintButton(): ReactElement {
  useEffect(() => {
    let saved: Array<{ element: HTMLDetailsElement; open: boolean }> | null = null;

    function restore() {
      if (saved !== null) {
        for (const item of saved) item.element.open = item.open;
        saved = null;
      }
      document.body.removeAttribute("data-guide-printing");
    }

    function prepare() {
      if (saved !== null) return;
      const reader = document.querySelector<HTMLElement>("[data-guide-reader]");
      if (!reader) return;
      saved = Array.from(reader.querySelectorAll<HTMLDetailsElement>("[data-guide-troubleshooting] details"), (element) => ({ element, open: element.open }));
      for (const item of saved) item.element.open = true;
      document.body.setAttribute("data-guide-printing", "");
    }

    window.addEventListener("beforeprint", prepare);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", prepare);
      window.removeEventListener("afterprint", restore);
      restore();
    };
  }, []);

  return (
    <Button type="button" variant="outline" size="sm" data-guide-screen-only onClick={() => window.print()} className="min-h-11">
      <Printer aria-hidden="true" className="h-4 w-4" />
      Cetak panduan
    </Button>
  );
}
