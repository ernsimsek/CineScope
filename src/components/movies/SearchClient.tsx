"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TmdbMovie } from "@/lib/tmdb";
import MovieCard from "@/components/movies/MovieCard";
import { LoadingSpinner, SkeletonGrid } from "@/components/ui/Loading";
import styles from "@/components/movies/BrowseClient.module.css";

type Props = {
  initialQuery: string;
  initialResults: TmdbMovie[];
};

export default function SearchClient({ initialQuery, initialResults }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<TmdbMovie[]>(initialResults);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);
  const queryRef = useRef(query);
  queryRef.current = query;

  const doSearch = useCallback(async (q: string) => {
    const id = ++reqIdRef.current;
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("search failed");
      const data = (await res.json()) as { results: TmdbMovie[] };
      if (id === reqIdRef.current) {
        setResults(data.results);
      }
    } catch {
      if (id === reqIdRef.current) setResults([]);
    } finally {
      if (id === reqIdRef.current) setLoading(false);
    }
  }, []);

  // Update URL without blocking input
  const updateUrl = useCallback((q: string) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    router.replace(`/search?${next.toString()}`, { scroll: false });
  }, [router]);

  // Debounced search — no deps that change on every keystroke
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === initialQuery.trim()) return;

    setLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(trimmed);
      updateUrl(trimmed);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const trimmed = query.trim();

  return (
    <main className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>Search</h1>
        <p className={styles.subtitle}>
          {trimmed ? (
            <>
              {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{trimmed}&rdquo;
            </>
          ) : (
            "Type to search the archives"
          )}
        </p>
      </div>

      <div style={{ marginTop: "var(--space-4)" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search films, directors, decades…"
          autoFocus
          style={{
            width: "100%",
            maxWidth: 720,
            height: 64,
            padding: "0 var(--space-2)",
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--color-line)",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--color-paper)",
          }}
        />
      </div>

      <div style={{ marginTop: "var(--space-4)" }}>
        {loading ? (
          <SkeletonGrid count={6} />
        ) : results.length === 0 && trimmed ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>Nothing in the archives.</h2>
            <p className={styles.emptyText}>Try a different title, director, or keyword.</p>
            <div style={{ marginTop: "var(--space-4)", display: "flex", justifyContent: "center" }}>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="var(--color-mercury)" strokeWidth="1" opacity="0.3" aria-hidden>
                <circle cx="60" cy="60" r="50" />
                <circle cx="60" cy="60" r="38" />
                <circle cx="60" cy="60" r="26" />
                <circle cx="60" cy="60" r="14" />
                <circle cx="60" cy="60" r="2" fill="var(--color-mercury)" />
              </svg>
            </div>
          </div>
        ) : results.length === 0 ? (
          <LoadingSpinner label="Awaiting query…" />
        ) : (
          <div className={styles.grid}>
            {results.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
