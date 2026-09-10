import type { MetadataRoute } from "next";
import { getGenres } from "@/lib/tmdb";

export const revalidate = 86_400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cinescope.local";
  const now = new Date();
  const staticRoutes = ["", "/movies", "/search"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  let genreUrls: MetadataRoute.Sitemap = [];
  try {
    const { genres } = await getGenres();
    genreUrls = genres.map((g) => ({
      url: `${base}/genre/${g.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    /* ignore — static routes still published */
  }

  return [...staticRoutes, ...genreUrls];
}
