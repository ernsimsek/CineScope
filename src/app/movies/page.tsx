import { Suspense } from "react";
import BrowseClient from "@/components/movies/BrowseClient";
import { discoverMovies, getGenres } from "@/lib/tmdb";
import { LoadingSpinner } from "@/components/ui/Loading";

export const revalidate = 3600;

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
  try { return await p; } catch { return fallback; }
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const sortBy = params.sort_by ?? "popularity.desc";
  const genre = params.genre ? Number(params.genre) : undefined;
  const year = params.year ? Number(params.year) : undefined;

  const [discover, genres] = await Promise.all([
    safe(
      discoverMovies({ page, sortBy, genre, primaryReleaseYear: year }),
      { page: 1, results: [], total_pages: 0, total_results: 0 },
    ),
    safe(getGenres(), { genres: [] }),
  ]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BrowseClient
        initialMovies={discover.results}
        initialGenres={genres.genres}
        initialPage={discover.page}
        initialTotalPages={discover.total_pages}
      />
    </Suspense>
  );
}
