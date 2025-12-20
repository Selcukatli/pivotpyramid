import { MetadataRoute } from "next";
import { getAllChapterSlugs } from "@/lib/ebook-parser";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pivotpyramid.com";
  const chapterSlugs = getAllChapterSlugs();

  const ebookPages: MetadataRoute.Sitemap = chapterSlugs.map((slug) => ({
    url: `${baseUrl}/ebook/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/canvas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ebook`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...ebookPages,
  ];
}
