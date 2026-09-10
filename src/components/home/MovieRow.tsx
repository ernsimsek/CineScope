"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TmdbMovie } from "@/lib/tmdb";
import MovieCard from "@/components/movies/MovieCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import styles from "./MovieRow.module.css";

type Props = {
  title: string;
  subtitle?: string;
  movies: TmdbMovie[];
};

export default function MovieRow({ title, subtitle, movies }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const moved = useRef(false);

  const [progress, setProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const ratio = max > 0 ? el.scrollLeft / max : 0;
    setProgress(ratio);
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < max - 4);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    draggingRef.current = true;
    moved.current = false;
    startX.current = e.pageX;
    startScroll.current = el.scrollLeft;
    el.classList.add(styles.dragging);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 3) moved.current = true;
    el.scrollLeft = startScroll.current - dx;
  }, []);

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
    const el = scrollerRef.current;
    if (el) el.classList.remove(styles.dragging);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [handleMouseMove, stopDrag]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 800), behavior: "smooth" });
  };

  return (
    <section className={`${styles.section} container`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            style={!canScrollLeft ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            style={!canScrollRight ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={wrapperRef} className={styles.rowWrapper}>
        <div
          ref={scrollerRef}
          className={styles.scroller}
          onMouseDown={handleMouseDown}
          onScroll={updateScrollState}
          onClickCapture={(e) => {
            // Suppress click after a drag so cards don't navigate
            if (moved.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {movies.map((movie, i) => (
            <ScrollReveal key={movie.id} delay={i * 40} className={styles.item}>
              <MovieCard movie={movie} />
            </ScrollReveal>
          ))}
        </div>

        {/* Edge fades — show when more content is in that direction */}
        <span
          className={`${styles.edgeFade} ${styles.edgeFadeLeft}`}
          style={{ opacity: canScrollLeft ? 1 : 0 }}
          aria-hidden
        />
        <span
          className={`${styles.edgeFade} ${styles.edgeFadeRight}`}
          style={{ opacity: canScrollRight ? 1 : 0 }}
          aria-hidden
        />
      </div>

      {/* Custom progress bar — replaces the ugly native scrollbar */}
      <div className={styles.progressTrack} aria-hidden>
        <div
          className={styles.progressBar}
          style={{ width: `${Math.max(progress * 100, 8)}%` }}
        />
      </div>
    </section>
  );
}
