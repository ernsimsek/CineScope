import type { TmdbMovie } from "@/lib/tmdb";
import MovieCard from "@/components/movies/MovieCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./UpcomingGrid.module.css";

type Props = {
  movies: TmdbMovie[];
  title?: string;
  subtitle?: string;
};

export default function UpcomingGrid({
  movies,
  title = "Upcoming Releases",
  subtitle = "Coming soon to a screen near you",
}: Props) {
  return (
    <section className={`${styles.section} container`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.grid}>
        {movies.slice(0, 8).map((movie, i) => (
          <ScrollReveal key={movie.id} delay={i * 50}>
            <MovieCard movie={movie} variant="release" />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
