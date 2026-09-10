import Image from "next/image";
import Link from "next/link";
import type { TmdbMovie } from "@/lib/tmdb";
import { getPosterUrl } from "@/lib/tmdb-images";
import { formatYear, formatRating, formatReleaseChip } from "@/lib/utils";
import styles from "./MovieCard.module.css";

type Variant = "default" | "release";

type MovieCardProps = {
  movie: TmdbMovie;
  variant?: Variant;
  priority?: boolean;
};

export default function MovieCard({
  movie,
  variant = "default",
  priority = false,
}: MovieCardProps) {
  const poster = getPosterUrl(movie.poster_path, "w500");

  return (
    <Link href={`/movies/${movie.id}`} className={styles.card} aria-label={movie.title}>
      <div className={styles.posterWrap}>
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className={styles.poster}
            priority={priority}
          />
        ) : (
          <div className={styles.noPoster} aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" />
              <path d="M3 16l5-5 4 4 3-3 6 6" />
              <circle cx="8.5" cy="8.5" r="1.5" />
            </svg>
            <span>◉ No poster</span>
          </div>
        )}

        <span className={styles.rating} aria-label={`Rating ${formatRating(movie.vote_average)}`}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {formatRating(movie.vote_average)}
        </span>

        <div className={styles.playOverlay} aria-hidden>
          <span className={styles.playIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l16 9-16 9V3z" />
            </svg>
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{movie.title}</h3>
        <div className={styles.meta}>
          {variant === "release" ? (
            <span className={styles.releaseDate}>
              {formatReleaseChip(movie.release_date)}
            </span>
          ) : (
            <>
              <span>{formatYear(movie.release_date)}</span>
              <span className={styles.metaSep} aria-hidden />
              <span>{formatRating(movie.vote_average)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
