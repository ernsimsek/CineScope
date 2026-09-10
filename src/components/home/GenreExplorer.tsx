import Link from "next/link";
import type { TmdbGenre, TmdbMovie } from "@/lib/tmdb";
import { getBackdropUrl } from "@/lib/tmdb";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./GenreExplorer.module.css";

type Props = {
  genres: TmdbGenre[];
  moviesByGenre: Record<number, TmdbMovie[]>;
};

const GENRE_TILES: { id: number; placement: keyof typeof styles }[] = [
  { id: 18, placement: "drama" },
  { id: 27, placement: "horror" },
  { id: 35, placement: "comedy" },
  { id: 28, placement: "action" },
  { id: 14, placement: "fantasy" },
  { id: 80, placement: "crime" },
  { id: 16, placement: "animation" },
];

const GENRE_IMAGES: Record<number, string> = {
  28: "/Action.jpg",
  16: "/Animation.jpg",
  35: "/Comedy.jpg",
  80: "/Crime.jpg",
  18: "/Drama.jpg",
  14: "/Fantasy.jpg",
  27: "/Horror.jpg",
};

export default function GenreExplorer({ genres, moviesByGenre }: Props) {
  // Preserve the GENRE_TILES ordering and drop any IDs that the TMDB genre
  // list didn't return (so we don't end up with undefined tiles that break
  // the unique-key contract in the children map).
  const visible = GENRE_TILES
    .map((t) => {
      const g = genres.find((x) => x.id === t.id);
      return g ? { ...g, placement: t.placement } : null;
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  return (
    <section className={`${styles.section} container`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Genre Explorer</h2>
          <p className={styles.subtitle}>Curate by mood, era, or obsession</p>
        </div>
      </div>

      <div className={styles.masonry}>
        {visible.map((g, i) => {
          const movies = moviesByGenre[g.id] ?? [];
          const representative = movies[0];
          const localImage = GENRE_IMAGES[g.id];
          const bg = localImage ?? (representative ? getBackdropUrl(representative.backdrop_path, "w780") : null);
          return (
            <ScrollReveal
              key={g.id}
              delay={i * 50}
              className={`${styles.tile} ${styles[g.placement]}`}
              style={
                bg
                  ? ({
                      ["--bg" as never]: `url(${bg})`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <Link
                href={`/genre/${g.id}`}
                className={styles.tileLink}
                aria-label={`Explore ${g.name} films`}
              >
                <div className={styles.tileContent}>
                  <span className={styles.tileTitle}>{g.name}</span>
                  <span className={styles.tileCount}>
                    {movies.length > 0 ? `${movies.length}+ titles` : "Browse"}
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
