"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import type { TmdbProvider, TmdbWatchProviders } from "@/lib/tmdb";
import { getImageUrl } from "@/lib/tmdb-images";
import styles from "./WhereToWatch.module.css";

type Props = {
  providers: TmdbWatchProviders | null;
  movieTitle: string;
};

// Region display priority — try the visitor's most likely region first
const REGION_PRIORITY = ["US", "GB", "TR", "DE", "FR", "ES", "IT", "BR", "MX", "JP", "KR", "IN"];

const REGION_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  TR: "Türkiye",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  BR: "Brazil",
  MX: "Mexico",
  JP: "Japan",
  KR: "South Korea",
  IN: "India",
  CA: "Canada",
  AU: "Australia",
};

const GROUP_LABELS: Record<string, string> = {
  flatrate: "Streaming",
  free: "Free",
  ads: "Free with Ads",
  rent: "Rent",
  buy: "Buy",
};

export default function WhereToWatch({ providers, movieTitle }: Props) {
  const availableRegions = useMemo(
    () =>
      providers
        ? Object.keys(providers.results).sort((a, b) => {
            const ai = REGION_PRIORITY.indexOf(a);
            const bi = REGION_PRIORITY.indexOf(b);
            if (ai === -1 && bi === -1) return a.localeCompare(b);
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
          })
        : [],
    [providers],
  );

  const [region, setRegion] = useState<string>(() => availableRegions[0] ?? "US");

  const regionData = providers?.results[region];

  // Stable key per (region, provider id, type) — guards against duplicate ids
  // that can sneak in from upstream API quirks.
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Where to Watch</h2>

      {availableRegions.length > 0 ? (
        <>
          <div className={styles.regionRow} role="tablist" aria-label="Region">
            {availableRegions.slice(0, 8).map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={r === region}
                className={`${styles.regionChip} ${r === region ? styles.regionChipActive : ""}`}
                onClick={() => setRegion(r)}
                title={REGION_NAMES[r] ?? r}
              >
                {r}
              </button>
            ))}
          </div>

          {regionData ? (
            <>
              {(["flatrate", "free", "ads", "rent", "buy"] as const).map((type) => {
                const list = (regionData[type] ?? []) as TmdbProvider[];
                if (list.length === 0) return null;
                return (
                  <div key={`${region}-${type}`} className={styles.group}>
                    <div className={styles.groupLabel}>{GROUP_LABELS[type]}</div>
                    <div className={styles.providers}>
                      {list.map((p, i) => {
                        const logo = getImageUrl(p.logo_path, "w92");
                        return (
                          <div
                            key={`${region}-${type}-${p.provider_id}-${i}`}
                            className={styles.provider}
                            title={`Watch ${movieTitle} on ${p.provider_name}`}
                          >
                            <span className={styles.logo}>
                              {logo ? (
                                <Image
                                  src={logo}
                                  alt={p.provider_name}
                                  width={36}
                                  height={36}
                                  unoptimized
                                />
                              ) : (
                                <span className={styles.noLogo}>
                                  {p.provider_name?.[0] ?? "?"}
                                </span>
                              )}
                            </span>
                            <span className={styles.name}>{p.provider_name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className={styles.empty}>No providers listed for this region.</div>
          )}

          {regionData?.link && (
            <p className={styles.tmdbNote}>
              See more on{" "}
              <a href={regionData.link} target="_blank" rel="noreferrer">
                TMDB → JustWatch
              </a>
            </p>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          No streaming information available for {movieTitle} yet.
        </div>
      )}
    </section>
  );
}
