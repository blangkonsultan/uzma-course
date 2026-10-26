export type GuideRole = "admin" | "guru";

export interface GuideScreenshot {
  readonly src: `/guides/${GuideRole}/${string}.png`;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption: string;
  readonly sourceRoute: string;
  readonly state: string;
}

export interface GuideStep {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export interface GuideStepGroup {
  readonly id: string;
  readonly steps: readonly GuideStep[];
  readonly screenshots: readonly GuideScreenshot[];
  readonly warning?: string;
}

export interface GuideArticle {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly keywords: readonly string[];
  readonly prerequisites: readonly string[];
  readonly groups: readonly GuideStepGroup[];
  readonly expected: readonly string[];
  readonly systemRules: readonly string[];
  readonly recommendations: readonly string[];
  readonly troubleshooting: readonly { question: string; answer: string }[];
}

export interface GuideChapter {
  readonly id: string;
  readonly title: string;
  readonly articles: readonly GuideArticle[];
}

export interface GuideDefinition {
  readonly role: GuideRole;
  readonly title: string;
  readonly description: string;
  readonly defaultTopic: string;
  readonly chapters: readonly GuideChapter[];
}

export interface GuideIndexItem {
  readonly slug: string;
  readonly title: string;
  readonly chapterTitle: string;
  readonly searchText: string;
}
