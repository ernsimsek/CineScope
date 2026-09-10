import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMovieDetails, getBackdropUrl } from "@/lib/tmdb";
import MovieHero from "@/components/movies/MovieHero";
import MovieDetailContent from "@/components/movies/MovieDetailContent";
import CastRow from "@/components/movies/CastRow";
import SimilarMovies from "@/components/movies/SimilarMovies";

export const revalidate = 86_400;

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const movieId = Number(id);
  if (Number.isNaN(movieId)) return { title: "Film not found" };

  const details = await safe(getMovieDetails(movieId), null);
  if (!details) return { title: "Film not found" };

  const backdrop = getBackdropUrl(details.backdrop_path, "w1280");
  return {
    title: details.title,
    description: details.overview?.slice(0, 200),
    openGraph: {
      title: details.title,
      description: details.overview?.slice(0, 200),
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

  const details = await safe(getMovieDetails(movieId), null);
  if (!details) notFound();

  const cast = details.credits?.cast ?? [];
  const crew = details.credits?.crew ?? [];
  const videos = details.videos?.results ?? [];
  const similar = details.similar?.results ?? [];
  const providers = details["watch/providers"] ?? null;
  const reviews = details.reviews?.results ?? [];

  return (
    <main>
      <MovieHero movie={details} />
      <MovieDetailContent
        movie={details}
        cast={cast}
        crew={crew}
        videos={videos}
        watchProviders={providers}
        reviews={reviews}
      />
      <div className="container">
        <CastRow cast={cast} />
        <SimilarMovies movies={similar} />
      </div>
    </main>
  );
}
