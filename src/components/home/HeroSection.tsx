"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { TmdbMovie } from "@/lib/tmdb";
import { getBackdropUrl } from "@/lib/tmdb-images";
import { formatRuntime, formatYear, truncate } from "@/lib/utils";
import styles from "./HeroSection.module.css";

type Props = {
  movies: TmdbMovie[];
};

/** Shared with `.dotProgress` animation via `--hero-slide-duration` */
const SLIDE_MS = 6000;

export default function HeroSection({ movies }: Props) {
  const top = movies.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gen, setGen] = useState(0);

  const advance = useCallback(() => {
    setIndex((prev) => (prev + 1) % top.length);
    setGen((g) => g + 1);
  }, [top.length]);

  // Reset timer whenever the slide (or pause state) changes — stays in sync with progress bar
  useEffect(() => {
    if (top.length < 2 || paused) return;
    const id = window.setTimeout(advance, SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, gen, paused, top.length, advance]);

  const goTo = (i: number) => {
    if (i === index) return;
    setIndex(i);
    setGen((g) => g + 1);
  };

  if (top.length === 0) return null;
  const current = top[index];

  return (
    <section
      className={`${styles.hero} scanlines grain`}
      style={{ ["--hero-slide-duration" as string]: `${SLIDE_MS}ms` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      aria-label="Featured films"
    >
      {top.map((movie, i) => {
        const bg = getBackdropUrl(movie.backdrop_path, "original");
        return (
          <div
            key={movie.id}
            className={`${styles.slide} ${i === index ? styles.slideActive : ""}`}
            aria-hidden={i !== index}
          >
            <div
              className={styles.bg}
              style={bg ? { backgroundImage: `url(${bg})` } : undefined}
            />
          </div>
        );
      })}

      <div className={styles.vignette} aria-hidden />

      <div className={styles.content}>
        <div className="container">
          <div className={styles.eyebrow}>
            <span className={styles.yearChip}>{formatYear(current.release_date)}</span>
            <span className={styles.ratingChip}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {current.vote_average.toFixed(1)}
            </span>
            {current.runtime ? (
              <span className={styles.runtimeChip}>{formatRuntime(current.runtime)}</span>
            ) : null}
            {current.genres?.slice(0, 2).map((g) => (
              <span key={g.id} className={styles.genreChip}>
                {g.name}
              </span>
            ))}
          </div>

          <h1 className={styles.title}>{current.title}</h1>
          <p className={styles.overview}>{truncate(current.overview, 240)}</p>

          <div className={styles.cta}>
            <Link href={`/movies/${current.id}`} className="btn btn-primary">
              View film
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <button type="button" className="btn btn-ghost">
              Add to watchlist
            </button>
          </div>
        </div>
      </div>

      <div className={styles.indicatorRow} role="tablist" aria-label="Hero slides">
        {top.map((m, i) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1}: ${m.title}`}
            className={`${styles.dot2} ${i === index ? styles.dot2Active : ""}`}
            onClick={() => goTo(i)}
          >
            {i === index && (
              <span
                key={gen}
                className={`${styles.dotProgress} ${paused ? styles.dotProgressPaused : ""}`}
              />
            )}
          </button>
        ))}
      </div>

      <div className={styles.scrollHint} aria-hidden>
        <span>Scroll</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
