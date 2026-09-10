/**
 * Central cache settings — tune via CACHE_REVALIDATE_SECONDS in Vercel env.
 * Longer TTL = fewer serverless invocations and TMDB calls on Hobby tier.
 */
export const REVALIDATE_SECONDS = Number(
  process.env.CACHE_REVALIDATE_SECONDS ?? 86_400,
);

export function jsonCacheHeaders(maxAge = REVALIDATE_SECONDS): HeadersInit {
  return {
    "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 7}`,
  };
}

/** Search queries change less often than live sports — still cache popular lookups. */
export const SEARCH_CACHE_SECONDS = Number(
  process.env.SEARCH_CACHE_SECONDS ?? 3_600,
);
