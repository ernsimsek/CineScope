import type { TmdbMovie } from "@/lib/tmdb";
import MovieCard from "@/components/movies/MovieCard";
import styles from "./SimilarMovies.module.css";

type Props = {
  movies: TmdbMovie[];
  title?: string;
};

export default function SimilarMovies({ movies, title = "Similar Films" }: Props) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.row}>
        {movies.slice(0, 8).map((m) => (
          <div key={m.id} className={styles.item}>
            <MovieCard movie={m} />
          </div>
        ))}
      </div>
    </section>
  );
}
