import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "@/components/movies/SearchClient";
import { clampSearchQuery } from "@/lib/api-params";
import { searchMovies } from "@/lib/tmdb";
import { LoadingSpinner } from "@/components/ui/Loading";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the CINESCOPE archives.",
};

export const revalidate = 3_600;

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

type SearchParams = { q?: string };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: rawQ = "" } = await searchParams;
  const q = clampSearchQuery(rawQ);
  const data = await safe(
    q ? searchMovies(q) : Promise.resolve({ page: 1, results: [], total_pages: 0, total_results: 0 }),
    { page: 1, results: [], total_pages: 0, total_results: 0 },
  );

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchClient key={q} initialQuery={q} initialResults={data.results} />
    </Suspense>
  );
}
