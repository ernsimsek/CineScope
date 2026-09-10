import type { MetadataRoute } from "next";
import { getGenres } from "@/lib/tmdb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://cinescope.local";
  const now = new Date();
  const staticRoutes = ["", "/movies", "/search"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "daily" as const,
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
  } catch {}

  return [...staticRoutes, ...genreUrls];
}
