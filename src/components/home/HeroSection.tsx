"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TmdbMovie } from "@/lib/tmdb";
import { getBackdropUrl } from "@/lib/tmdb-images";
import { formatRuntime, formatYear, truncate } from "@/lib/utils";
import styles from "./HeroSection.module.css";

type Props = {
  movies: TmdbMovie[];
};

const SLIDE_MS = 6000;
const FADE_MS = 420;
/** w1280 is enough for hero — "original" (4K) causes decode jank on slide change */
const BACKDROP_SIZE = "w1280";

type IndicatorProps = {
  active: boolean;
  paused: boolean;
  cycleKey: number;
  label: string;
  onSelect: () => void;
  onComplete: () => void;
};

function SlideIndicator({
  active,
  paused,
  cycleKey,
  label,
  onSelect,
  onComplete,
}: IndicatorProps) {
  const progressRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const pausedRef = useRef(paused);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    pausedRef.current = paused;
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (!active) return;
    const el = progressRef.current;
    if (!el) return;

    animationRef.current?.cancel();
    el.style.transform = "translateY(-50%) scaleX(0)";

    const animation = el.animate(
      [
        { transform: "translateY(-50%) scaleX(0)" },
        { transform: "translateY(-50%) scaleX(1)" },
      ],
      { duration: SLIDE_MS, fill: "forwards", easing: "linear" },
    );
    animationRef.current = animation;

    if (pausedRef.current) animation.pause();

    animation.onfinish = () => {
      if (!pausedRef.current) onCompleteRef.current();
    };

    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [active, cycleKey]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation || !active) return;
    if (paused) animation.pause();
    else animation.play();
  }, [active, paused]);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={label}
      className={`${styles.dot2} ${active ? styles.dot2Active : ""}`}
      onClick={onSelect}
    >
      <span className={styles.dotTrack} aria-hidden />
      {active ? <span ref={progressRef} className={styles.dotProgress} aria-hidden /> : null}
    </button>
  );
}

export default function HeroSection({ movies }: Props) {
  const top = movies.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    top.forEach((movie) => {
      const url = getBackdropUrl(movie.backdrop_path, BACKDROP_SIZE);
      if (!url) return;
      const img = new Image();
      img.decoding = "async";
      img.src = url;
    });
  }, [top]);

  useEffect(() => {
    if (prevIndex === null) return;
    const id = window.setTimeout(() => setPrevIndex(null), FADE_MS);
    return () => window.clearTimeout(id);
  }, [prevIndex, index]);

  const changeSlide = useCallback(
    (next: number) => {
      if (next === index) return;
      setPrevIndex(index);
      setIndex(next);
      setCycleKey((k) => k + 1);
    },
    [index],
  );

  const advance = useCallback(() => {
    if (top.length < 2) return;
    changeSlide((index + 1) % top.length);
  }, [top.length, index, changeSlide]);

  const goTo = useCallback(
    (i: number) => {
      if (i === index) return;
      changeSlide(i);
    },
    [index, changeSlide],
  );

  if (top.length === 0) return null;
  const current = top[index];

  return (
    <section
      className={styles.hero}
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
      <div className={styles.slideStack} aria-hidden>
        {top.map((movie, i) => {
          const isActive = i === index;
          const isExit = i === prevIndex;
          const bg = getBackdropUrl(movie.backdrop_path, BACKDROP_SIZE);

          if (!isActive && !isExit) {
            return (
              <div key={movie.id} className={styles.slideHidden}>
                {bg ? <div className={styles.bg} style={{ backgroundImage: `url(${bg})` }} /> : null}
              </div>
            );
          }

          return (
            <div
              key={movie.id}
              className={`${styles.slide} ${isActive ? styles.slideActive : ""} ${isExit ? styles.slideExit : ""}`}
            >
              {bg ? <div className={styles.bg} style={{ backgroundImage: `url(${bg})` }} /> : null}
            </div>
          );
        })}
      </div>

      <div className={styles.vignette} aria-hidden />
      <div className={styles.heroTexture} aria-hidden />

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
          <SlideIndicator
            key={m.id}
            active={i === index}
            paused={paused}
            cycleKey={cycleKey}
            label={`Slide ${i + 1}: ${m.title}`}
            onSelect={() => goTo(i)}
            onComplete={advance}
          />
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
