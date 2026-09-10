const SORT_ALLOWLIST = new Set([
  "popularity.desc",
  "popularity.asc",
  "vote_average.desc",
  "vote_average.asc",
  "primary_release_date.desc",
  "primary_release_date.asc",
  "revenue.desc",
  "revenue.asc",
]);

export function parsePage(raw: string | null, max = 500): number {
  const n = Number(raw ?? 1);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), max);
}

export function parseSortBy(raw: string | null): string {
  const value = raw ?? "popularity.desc";
  return SORT_ALLOWLIST.has(value) ? value : "popularity.desc";
}

export function parseOptionalInt(
  raw: string | null,
  opts: { min?: number; max?: number } = {},
): number | undefined {
  if (raw === null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  const min = opts.min ?? 1;
  const max = opts.max ?? 999_999;
  const floored = Math.floor(n);
  if (floored < min || floored > max) return undefined;
  return floored;
}

export function clampSearchQuery(raw: string, maxLen = 200): string {
  return raw.trim().slice(0, maxLen);
}
