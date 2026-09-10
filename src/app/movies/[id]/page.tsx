import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getMovie,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getWatchProviders,
  getReviews,
  getBackdropUrl,
  type TmdbMovie,
  type TmdbCast,
  type TmdbCrew,
  type TmdbVideo,
  type TmdbWatchProviders,
  type TmdbReview,
} from "@/lib/tmdb";
import MovieHero from "@/components/movies/MovieHero";
import MovieDetailContent from "@/components/movies/MovieDetailContent";
import CastRow from "@/components/movies/CastRow";
import SimilarMovies from "@/components/movies/SimilarMovies";

export const revalidate = 3600;

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}

async function loadDetail(id: number) {
  return Promise.all([
    safe(getMovie(id), null as TmdbMovie | null),
    safe(getMovieCredits(id), { cast: [] as TmdbCast[], crew: [] as TmdbCrew[] }),
    safe(getMovieVideos(id), { results: [] as TmdbVideo[] }),
    safe(getSimilarMovies(id), { page: 1, results: [] as TmdbMovie[], total_pages: 0, total_results: 0 }),
    safe(getWatchProviders(id), null as TmdbWatchProviders | null),
    safe(getReviews(id), { id, page: 1, results: [] as TmdbReview[], total_pages: 0, total_results: 0 }),
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movieId = Number(id);
  if (Number.isNaN(movieId)) return { title: "Film not found" };

  const movie = await safe(getMovie(movieId), null as TmdbMovie | null);
  if (!movie) return { title: "Film not found" };

  const backdrop = getBackdropUrl(movie.backdrop_path, "w1280");
  return {
    title: movie.title,
    description: movie.overview?.slice(0, 200),
    openGraph: {
      title: movie.title,
      description: movie.overview?.slice(0, 200),
      images: backdrop ? [{ url: backdrop }] : [],
    },
  };
}

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);
  if (Number.isNaN(movieId) || movieId < 1) notFound();

  const [movie, credits, videos, similar, providers, reviews] = await loadDetail(movieId);
  if (!movie) notFound();

  return (
    <main>
      <MovieHero movie={movie} />
      <MovieDetailContent
        movie={movie}
        cast={credits.cast}
        crew={credits.crew}
        videos={videos.results}
        watchProviders={providers}
        reviews={reviews.results}
      />
      <div className="container">
        <CastRow cast={credits.cast} />
        <SimilarMovies movies={similar.results} />
      </div>
    </main>
  );
}
