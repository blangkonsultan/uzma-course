import type { GuideArticle, GuideDefinition, GuideIndexItem } from "@/types/guides";

export function createGuideIndex(guide: GuideDefinition): readonly GuideIndexItem[] {
  const index: GuideIndexItem[] = [];
  for (const chapter of guide.chapters) {
    for (const article of chapter.articles) {
      index.push({
        slug: article.slug,
        title: article.title,
        chapterTitle: chapter.title,
        searchText: `${chapter.title} ${article.title} ${article.keywords.join(" ")}`.toLocaleLowerCase("id-ID"),
      });
    }
  }
  return index;
}

export function resolveGuideArticle(
  guide: GuideDefinition,
  topic: string | string[] | undefined,
): GuideArticle {
  let fallback: GuideArticle | undefined;
  const requested = typeof topic === "string" ? topic : undefined;
  for (const chapter of guide.chapters) {
    for (const article of chapter.articles) {
      if (article.slug === requested) return article;
      if (article.slug === guide.defaultTopic) fallback = article;
    }
  }
  if (!fallback) throw new Error(`Panduan ${guide.role} tidak memiliki topik awal yang valid.`);
  return fallback;
}

export function filterGuideIndex(
  index: readonly GuideIndexItem[],
  query: string,
): readonly GuideIndexItem[] {
  const needle = query.trim().toLocaleLowerCase("id-ID");
  return needle ? index.filter((item) => item.searchText.includes(needle)) : index;
}
