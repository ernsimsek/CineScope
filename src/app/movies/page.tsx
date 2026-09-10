import { Suspense } from "react";
import BrowseClient from "@/components/movies/BrowseClient";
import { discoverMovies, getGenres } from "@/lib/tmdb";
import { LoadingSpinner } from "@/components/ui/Loading";

export const revalidate = 86_400;

type SearchParams = {
  genre?: string;
  sort_by?: string;
  year?: string;
  page?: string;
};

export const metadata = {
  title: "Browse All Films",
  description: "Explore the complete CINESCOPE archive. Filter by genre, year, and more.",
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const sortBy = params.sort_by ?? "popularity.desc";
  const genre = params.genre ? Number(params.genre) : undefined;
  const year = params.year ? Number(params.year) : undefined;
  const discoverParams = { sortBy, genre, primaryReleaseYear: year };

  // Prefetch two pages server-side so infinite scroll triggers fewer /api/movies hits.
  const [discover1, discover2, genres] = await Promise.all([
    safe(
      discoverMovies({ ...discoverParams, page: 1 }),
      { page: 1, results: [], total_pages: 0, total_results: 0 },
    ),
    safe(
      discoverMovies({ ...discoverParams, page: 2 }),
      { page: 2, results: [], total_pages: 0, total_results: 0 },
    ),
    safe(getGenres(), { genres: [] }),
  ]);

  const filterKey = `${genre ?? ""}-${sortBy}-${year ?? ""}`;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BrowseClient
        key={filterKey}
        initialMovies={[...discover1.results, ...discover2.results]}
        initialGenres={genres.genres}
        initialPage={discover2.page}
        initialTotalPages={discover1.total_pages}
      />
    </Suspense>
  );
}
