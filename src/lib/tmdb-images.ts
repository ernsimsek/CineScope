/**
 * Client-safe TMDB image URL helpers (no API credentials).
 */

export const IMAGE_BASE =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p";

export function getImageUrl(
  path: string | null | undefined,
  size: string = "w500",
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function getPosterUrl(path: string | null | undefined, size = "w780") {
  return getImageUrl(path, size);
}

export function getBackdropUrl(path: string | null | undefined, size = "original") {
  return getImageUrl(path, size);
}

export function getProfileUrl(path: string | null | undefined, size = "w342") {
  return getImageUrl(path, size);
}
