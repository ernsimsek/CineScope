import HeroSection from "@/components/home/HeroSection";
import MovieRow from "@/components/home/MovieRow";
import UpcomingGrid from "@/components/home/UpcomingGrid";
import GenreExplorer from "@/components/home/GenreExplorer";
import {
  getTrending,
  getNowPlaying,
  getUpcoming,
  getGenres,
  discoverMovies,
  type TmdbMovie,
} from "@/lib/tmdb";

export const revalidate = 3600;

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [trending, nowPlaying, upcoming, genres] = await Promise.all([
    safe(getTrending(), { page: 1, results: [], total_pages: 0, total_results: 0 }),
    safe(getNowPlaying(), { page: 1, results: [], total_pages: 0, total_results: 0 }),
    safe(getUpcoming(), { page: 1, results: [], total_pages: 0, total_results: 0 }),
    safe(getGenres(), { genres: [] }),
  ]);

  const moviesByGenre: Record<number, TmdbMovie[]> = {};
  // Limit to max 6 genre requests at a time to avoid hitting TMDB rate limits
  const MAX_PARALLEL_GENRES = 6;
  const genreSlice = genres.genres.slice(0, MAX_PARALLEL_GENRES);
  await Promise.all(
    genreSlice.map(async (g) => {
      const res = await safe(discoverMovies({ genre: g.id, page: 1 }), {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      });
      moviesByGenre[g.id] = res.results.slice(0, 3);
    }),
  );

  return (
    <main>
      <HeroSection movies={trending.results.slice(0, 5)} />
      <MovieRow
        title="Trending This Week"
        subtitle="Now Trending"
        movies={trending.results.slice(0, 12)}
      />
      <MovieRow
        title="In Cinemas Now"
        subtitle="Now Playing"
        movies={nowPlaying.results.slice(0, 12)}
      />
      <UpcomingGrid
        movies={upcoming.results.slice(0, 8)}
        title="Upcoming Releases"
        subtitle="Coming Soon"
      />
      <GenreExplorer genres={genres.genres} moviesByGenre={moviesByGenre} />
    </main>
  );
}
