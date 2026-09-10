import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { discoverMovies, getGenres, type TmdbGenre } from "@/lib/tmdb";
import BrowseClient from "@/components/movies/BrowseClient";
import { LoadingSpinner } from "@/components/ui/Loading";
import { Suspense } from "react";

export const revalidate = 86_400;

const GENRE_IMAGES: Record<number, string> = {
  28: "/Action.jpg",
  16: "/Animation.jpg",
  35: "/Comedy.jpg",
  80: "/Crime.jpg",
  18: "/Drama.jpg",
  14: "/Fantasy.jpg",
  27: "/Horror.jpg",
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const genres = await safe(getGenres(), { genres: [] as TmdbGenre[] });
  const genre = genres.genres.find((g) => g.id === Number(id));
  if (!genre) return { title: "Genre not found" };
  return {
    title: `${genre.name} Films`,
    description: `Discover ${genre.name.toLowerCase()} films on CINESCOPE.`,
  };
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genreId = Number(id);
  if (Number.isNaN(genreId)) notFound();

  const [genres, data] = await Promise.all([
    safe(getGenres(), { genres: [] as TmdbGenre[] }),
    safe(discoverMovies({ genre: genreId }), {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    }),
  ]);

  const genre = genres.genres.find((g) => g.id === genreId);
  if (!genre) notFound();

  const genreImage = GENRE_IMAGES[genreId];

  return (
    <>
      {genreImage && (
        <section style={{
          position: "relative",
          height: "320px",
          display: "flex",
          alignItems: "flex-end",
          padding: "var(--space-6) 0",
          overflow: "hidden",
        }}>
          <Image
            src={genreImage}
            alt=""
            fill
            priority
            style={{ objectFit: "cover" }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.9) 100%)",
          }} />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-flare)",
              marginBottom: "var(--space-1)",
            }}>
              Genre
            </p>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-display)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--color-paper)",
              lineHeight: "0.9",
            }}>
              {genre.name} Films
            </h1>
          </div>
        </section>
      )}
      <Suspense fallback={<LoadingSpinner />}>
        <BrowseClient
          initialMovies={data.results}
          initialGenres={genres.genres}
          initialPage={data.page}
          initialTotalPages={data.total_pages}
        />
      </Suspense>
    </>
  );
}
