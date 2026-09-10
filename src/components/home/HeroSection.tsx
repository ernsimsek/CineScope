"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import type { TmdbMovie } from "@/lib/tmdb";
import { getBackdropUrl } from "@/lib/tmdb";
import { formatRuntime, formatYear, truncate } from "@/lib/utils";
import RatingBadge from "@/components/ui/RatingBadge";
import styles from "./HeroSection.module.css";

type Props = {
  movies: TmdbMovie[];
};

const INTERVAL = 6000;

export default function HeroSection({ movies }: Props) {
  const top = movies.slice(0, 5);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const [gen, setGen] = useState(0);

  useEffect(() => {
    if (top.length < 2) return;
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setIndex((prev) => (prev + 1) % top.length);
        setGen((g) => g + 1);
      }
    }, INTERVAL);
    return () => clearInterval(id);
  }, [top.length]);

  const goTo = (i: number) => {
    setIndex(i);
    setGen((g) => g + 1);
  };

  if (top.length === 0) return null;
  const current = top[index];

  return (
    <section
      className={`${styles.hero} scanlines grain`}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
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

      <div className="container">
        <div className={styles.content}>
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
              <span key={gen} className={styles.dotProgress} />
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
