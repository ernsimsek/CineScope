import Link from "next/link";
import type { TmdbMovie } from "@/lib/tmdb";
import { getBackdropUrl } from "@/lib/tmdb-images";
import { formatRuntime, formatYear } from "@/lib/utils";
import styles from "./MovieHero.module.css";

type Props = { movie: TmdbMovie };

export default function MovieHero({ movie }: Props) {
  const bg = getBackdropUrl(movie.backdrop_path, "original");

  return (
    <section className={`${styles.hero} scanlines grain`}>
      <div
        className={styles.bg}
        style={bg ? { backgroundImage: `url(${bg})` } : undefined}
        aria-hidden
      />
      <div className={styles.fade} aria-hidden />

      <div className={`container ${styles.inner}`}>
        <div className={styles.eyebrow}>
          <span className={styles.yearChip}>{formatYear(movie.release_date)}</span>
          <span className={styles.ratingChip}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {movie.vote_average.toFixed(1)} / 10
          </span>
          {movie.runtime ? (
            <span className={styles.runtimeChip}>{formatRuntime(movie.runtime)}</span>
          ) : null}
          {movie.genres?.map((g) => (
            <Link key={g.id} href={`/genre/${g.id}`} className={styles.genrePill}>
              {g.name}
            </Link>
          ))}
        </div>

        <h1 className={styles.title}>{movie.title}</h1>
        {movie.tagline ? (
          <p className={styles.tagline}>&ldquo;{movie.tagline}&rdquo;</p>
        ) : null}
      </div>
    </section>
  );
}
