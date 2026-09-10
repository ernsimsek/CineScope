"use client";

import Image from "next/image";
import { useState } from "react";
import type {
  TmdbCast,
  TmdbCrew,
  TmdbMovie,
  TmdbVideo,
  TmdbReview,
  TmdbWatchProviders,
} from "@/lib/tmdb";
import { getPosterUrl } from "@/lib/tmdb-images";
import {
  formatCurrency,
  formatDate,
  formatRating,
  formatRuntime,
} from "@/lib/utils";
import TrailerModal from "@/components/movies/TrailerModal";
import WhereToWatch from "@/components/movies/WhereToWatch";
import Reviews from "@/components/movies/Reviews";
import styles from "./MovieDetailContent.module.css";

type Props = {
  movie: TmdbMovie;
  cast: TmdbCast[];
  crew: TmdbCrew[];
  videos: TmdbVideo[];
  watchProviders: TmdbWatchProviders | null;
  reviews: TmdbReview[];
};

function findTrailer(videos: TmdbVideo[]): TmdbVideo | null {
  if (!videos || videos.length === 0) return null;
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube");
  return trailer ?? null;
}

function getDirector(crew: TmdbCrew[]): string {
  const d = crew.find((c) => c.job === "Director");
  return d?.name ?? "—";
}

function StarRating({ value }: { value: number }) {
  // 10-point scale, render 5 stars
  const filled = Math.round(value / 2);
  return (
    <div className={styles.ratingStars} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={i > filled ? "empty" : ""}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function MovieDetailContent({
  movie,
  cast,
  crew,
  videos,
  watchProviders,
  reviews,
}: Props) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const trailer = findTrailer(videos);
  const director = getDirector(crew);
  const poster = getPosterUrl(movie.poster_path);

  return (
    <div className="container">
      <div className={styles.body}>
        <div className={styles.left}>
          <p className={styles.overview}>{movie.overview}</p>
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setTrailerOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l16 9-16 9V3z" />
              </svg>
              Watch Trailer
            </button>
            <button type="button" className="btn btn-ghost">
              + Watchlist
            </button>
          </div>

          {/* STATS DASHBOARD — fills the empty vertical space */}
          <div className={styles.statsSection}>
            <div className={styles.statsLabel}>Quick Stats</div>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <div className={`${styles.statValue} ${styles.gold}`}>
                  {formatRating(movie.vote_average)}
                </div>
                <div className={styles.statLabel}>TMDB Rating</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>
                  {movie.vote_count.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Votes</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>{formatRuntime(movie.runtime)}</div>
                <div className={styles.statLabel}>Runtime</div>
              </div>
              <div className={styles.stat}>
                <div className={`${styles.statValue} ${styles.flare}`}>
                  {formatCurrency(movie.budget)}
                </div>
                <div className={styles.statLabel}>Budget</div>
              </div>
              <div className={styles.stat}>
                <div className={`${styles.statValue} ${styles.gold}`}>
                  {formatCurrency(movie.revenue)}
                </div>
                <div className={styles.statLabel}>Box Office</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>
                  {movie.revenue && movie.budget && movie.budget > 0
                    ? `${((movie.revenue / movie.budget) * 100).toFixed(0)}%`
                    : "—"}
                </div>
                <div className={styles.statLabel}>Return</div>
              </div>
            </div>
          </div>

          {/* FEATURED CREW */}
          <div className={styles.crewSection}>
            <div className={styles.statsLabel}>Key Crew</div>
            <div className={styles.crewGrid}>
              {[
                { job: "Director", name: crew.find((c) => c.job === "Director")?.name ?? "—" },
                {
                  job: "Writer",
                  name:
                    crew.find((c) => c.department === "Writing" && c.job === "Writer")?.name ??
                    crew.find((c) => c.department === "Writing")?.name ??
                    "—",
                },
                {
                  job: "Cinematography",
                  name: crew.find((c) => c.department === "Camera")?.name ?? "—",
                },
                {
                  job: "Composer",
                  name: crew.find((c) => c.department === "Sound")?.name ?? "—",
                },
                {
                  job: "Editor",
                  name: crew.find((c) => c.department === "Editing")?.name ?? "—",
                },
                {
                  job: "Production Design",
                  name: crew.find((c) => c.department === "Art")?.name ?? "—",
                },
              ]
                .filter((c) => c.name !== "—")
                .slice(0, 6)
                .map((c, i) => (
                  <div key={`crew-${c.job}-${i}`} className={styles.crewCard}>
                    <span className={styles.crewJob}>{c.job}</span>
                    <span className={styles.crewName}>{c.name}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* PRODUCTION COMPANIES */}
          {movie.production_companies && movie.production_companies.length > 0 ? (
            <div className={styles.productionSection}>
              <div className={styles.statsLabel}>Produced by</div>
              <div className={styles.companies}>
                {movie.production_companies.slice(0, 6).map((c, i) => (
                  <span key={`company-${c.id}-${i}`} className={styles.company}>
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className={styles.right}>
          <div className={styles.poster}>
            {poster ? (
              <Image
                src={poster}
                alt={movie.title}
                fill
                sizes="360px"
                className={styles.posterImg}
                priority
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: "var(--font-mono)", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "11px", color: "var(--color-mercury)" }}>
                ◉ No poster
              </div>
            )}
          </div>

          <div className={styles.ratingBlock}>
            <div className={styles.ratingValue}>{formatRating(movie.vote_average)}</div>
            <div className={styles.ratingMax}>out of 10</div>
            <StarRating value={movie.vote_average} />
            <div className={styles.ratingCount}>
              {movie.vote_count.toLocaleString()} votes
            </div>
          </div>

          <div className={styles.metaBlock}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Director</span>
              <span className={styles.metaValue}>{director}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Released</span>
              <span className={styles.metaValue}>{formatDate(movie.release_date)}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Runtime</span>
              <span className={styles.metaValue}>{formatRuntime(movie.runtime)}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Status</span>
              <span className={styles.metaValue}>{movie.status ?? "—"}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Budget</span>
              <span className={styles.metaValue}>{formatCurrency(movie.budget)}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Revenue</span>
              <span className={styles.metaValue}>{formatCurrency(movie.revenue)}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Original Language</span>
              <span className={styles.metaValue}>
                {movie.original_language?.toUpperCase() ?? "—"}
              </span>
            </div>
            <a
              href={`https://www.themoviedb.org/movie/${movie.id}`}
              target="_blank"
              rel="noreferrer"
              className={styles.tmdbLink}
            >
              Visit TMDB page
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          </div>
        </aside>
      </div>

      <div className={styles.belowGrid}>
        <WhereToWatch providers={watchProviders} movieTitle={movie.title} />
        <Reviews reviews={reviews} />
      </div>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videoKey={trailer?.key ?? null}
        title={movie.title}
      />
    </div>
  );
}
