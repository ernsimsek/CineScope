import HeroSection from "@/components/home/HeroSection";
import MovieRow from "@/components/home/MovieRow";
import UpcomingGrid from "@/components/home/UpcomingGrid";
import GenreExplorer from "@/components/home/GenreExplorer";
import { getTrending, getNowPlaying, getUpcoming, getGenres } from "@/lib/tmdb";

/** 24h ISR — lowers Vercel serverless usage on Hobby tier */
export const revalidate = 86_400;

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
      <GenreExplorer genres={genres.genres} />
    </main>
  );
}
