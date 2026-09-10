import Link from "next/link";
import type { TmdbGenre } from "@/lib/tmdb";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./GenreExplorer.module.css";

type Props = {
  genres: TmdbGenre[];
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

export default function GenreExplorer({ genres }: Props) {
  const visible = GENRE_TILES.map((t) => {
    const g = genres.find((x) => x.id === t.id);
    return g ? { ...g, placement: t.placement } : null;
  }).filter((g): g is NonNullable<typeof g> => g !== null);

  return (
    <section id="genres" className={`${styles.section} container`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Genre Explorer</h2>
          <p className={styles.subtitle}>Curate by mood, era, or obsession</p>
        </div>
      </div>

      <div className={styles.masonry}>
        {visible.map((g, i) => {
          const localImage = GENRE_IMAGES[g.id];
          return (
            <ScrollReveal
              key={g.id}
              delay={i * 50}
              className={`${styles.tile} ${styles[g.placement]}`}
              style={
                localImage
                  ? ({ ["--bg" as never]: `url(${localImage})` } as React.CSSProperties)
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
                  <span className={styles.tileCount}>Explore</span>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
