"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollHide } from "@/hooks/useScrollHide";
import type { TmdbGenre, TmdbMovie } from "@/lib/tmdb";
import MovieCard from "@/components/movies/MovieCard";
import { LoadingSpinner, SkeletonGrid } from "@/components/ui/Loading";
import styles from "./BrowseClient.module.css";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Rating" },
  { value: "primary_release_date.desc", label: "Release date" },
  { value: "revenue.desc", label: "Revenue" },
];

type Props = {
  initialMovies: TmdbMovie[];
  initialGenres: TmdbGenre[];
  initialPage: number;
  initialTotalPages: number;
};

export default function BrowseClient({
  initialMovies,
  initialGenres,
  initialPage,
  initialTotalPages,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const filterRef = useScrollHide<HTMLDivElement>(styles.filterHidden);

  const [movies, setMovies] = useState<TmdbMovie[]>(initialMovies);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  const genre = params.get("genre") ?? "";
  const sortBy = params.get("sort_by") ?? "popularity.desc";
  const year = params.get("year") ?? "";

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value && value !== "") next.set(key, value);
      else next.delete(key);
      router.replace(`/movies?${next.toString()}`);
    },
    [params, router],
  );

  const loadMore = useCallback(async () => {
    if (loading || page >= totalPages) return;
    setLoading(true);
    try {
      const search = new URLSearchParams();
      if (genre) search.set("genre", genre);
      if (sortBy) search.set("sort_by", sortBy);
      if (year) search.set("year", year);
      search.set("page", String(page + 1));

      const res = await fetch(`/api/movies?${search.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { results: TmdbMovie[]; page: number; total_pages: number };
      setMovies((prev) => [...prev, ...data.results]);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch {
      // Silently stop on error — user can scroll to retry
    } finally {
      setLoading(false);
    }
  }, [loading, page, totalPages, genre, sortBy, year]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadMore();
        });
      },
      { rootMargin: "400px" },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [loadMore]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <main className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>All Films</h1>
        <p className={styles.subtitle}>
          {movies.length} {movies.length === 1 ? "title" : "titles"} in the archive
        </p>
      </div>

      <div ref={filterRef} className={styles.filterBar}>
        <div className={`container ${styles.filterInner}`}>
          <div className={styles.filterGroup}>
            <label htmlFor="genre" className={styles.filterLabel}>Genre</label>
            <select
              id="genre"
              className={styles.select}
              value={genre}
              onChange={(e) => updateParams("genre", e.target.value || null)}
            >
              <option value="">All</option>
              {initialGenres.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="sort" className={styles.filterLabel}>Sort by</label>
            <select
              id="sort"
              className={styles.select}
              value={sortBy}
              onChange={(e) => updateParams("sort_by", e.target.value)}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="year" className={styles.filterLabel}>Year</label>
            <input
              id="year"
              type="number"
              min="1900"
              max={currentYear + 5}
              className={styles.yearInput}
              value={year}
              placeholder="Any"
              onChange={(e) => updateParams("year", e.target.value || null)}
            />
          </div>

          {(genre || sortBy !== "popularity.desc" || year) && (
            <button
              type="button"
              className={styles.clear}
              onClick={() => router.replace("/movies")}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {movies.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>The reel is empty.</h2>
          <p className={styles.emptyText}>No films match your filters.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {movies.map((m, i) => (
            // Use id + index to guarantee uniqueness even if the API returns
            // duplicate ids (TMDB occasionally does this on edge cases).
            <MovieCard key={`${m.id}-${i}`} movie={m} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className={styles.sentinel}>
        {loading ? <SkeletonGrid count={6} /> : page < totalPages ? "Loading more…" : ""}
      </div>

      {loading && (
        <div style={{ padding: "var(--space-3) 0", display: "flex", justifyContent: "center" }}>
          <LoadingSpinner label="Loading the reel…" />
        </div>
      )}
    </main>
  );
}
