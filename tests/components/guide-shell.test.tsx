import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GuideShell } from "@/components/guides/guide-shell";
import type { GuideIndexItem } from "@/types/guides";

const index: readonly GuideIndexItem[] = [
  { slug: "mulai", title: "Intro fixture", chapterTitle: "Basics fixture", searchText: "intro fixture basics fixture" },
  { slug: "spp-catat-pembayaran", title: "Payment fixture", chapterTitle: "Finance fixture", searchText: "payment fixture finance fixture kwitansi" },
];

function shell(activeSlug: string) {
  return (
    <GuideShell role="admin" basePath="/admin/panduan" index={index} activeSlug={activeSlug}>
      <article id="guide-article" tabIndex={-1} aria-label="Fixture article">
        <h2>Synthetic guide article</h2>
      </article>
    </GuideShell>
  );
}

afterEach(cleanup);

describe("guide contents interaction", () => {
  it("recovers from no matches while preserving the selected topic", () => {
    render(shell("mulai"));
    const search = screen.getByRole("searchbox");
    search.focus();
    fireEvent.change(search, { target: { value: "no-such-task" } });
    expect(screen.queryByRole("link", { name: "Payment fixture" })).toBeNull();
    expect(document.activeElement).toBe(search);
    fireEvent.click(screen.getByRole("button", { name: "Hapus pencarian" }));
    expect(screen.getByRole("link", { name: "Payment fixture" })).not.toBeNull();
    expect(screen.getByRole("link", { name: "Intro fixture" }).getAttribute("aria-current")).toBe("page");
  });

  it("tracks a new server-selected topic and focuses the article", () => {
    const { rerender } = render(shell("mulai"));
    rerender(shell("spp-catat-pembayaran"));
    expect(screen.getByRole("link", { name: "Payment fixture" }).getAttribute("aria-current")).toBe("page");
    expect(document.activeElement).toBe(screen.getByRole("article"));
  });
});
