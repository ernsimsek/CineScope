/**
 * Tiny utility functions used across the UI.
 */

export function formatDate(input: string | undefined | null): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatReleaseChip(input: string | undefined | null): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  return `${month} ${day}`;
}

export function formatYear(input: string | undefined | null): string {
  if (!input) return "—";
  const year = input.slice(0, 4);
  return year || "—";
}

export function formatRuntime(minutes: number | undefined | null): string {
  if (!minutes || minutes < 1) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatCurrency(value: number | undefined | null): string {
  if (!value || value < 1) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function formatRating(value: number | undefined | null): string {
  if (value === undefined || value === null) return "—";
  return value.toFixed(1);
}

export function truncate(text: string | undefined | null, max = 200): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "…";
}

export function classNames(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}
