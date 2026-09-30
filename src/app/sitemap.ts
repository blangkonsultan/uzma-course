import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://uzmacourse.com",
      lastModified: new Date(),
    },
  ];
}
