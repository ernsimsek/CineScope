import { NextResponse } from "next/server";
import { clampSearchQuery, parsePage } from "@/lib/api-params";
import { jsonCacheHeaders, SEARCH_CACHE_SECONDS } from "@/lib/cache-config";
import { searchMovies } from "@/lib/tmdb";

export const revalidate = 3_600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = clampSearchQuery(searchParams.get("q") ?? "");
  const page = parsePage(searchParams.get("page"));

  try {
    const data = q
      ? await searchMovies(q, page)
      : { page: 1, results: [], total_pages: 0, total_results: 0 };
    return NextResponse.json(data, {
      headers: jsonCacheHeaders(SEARCH_CACHE_SECONDS),
    });
  } catch {
    return NextResponse.json(
      { page: 1, results: [], total_pages: 0, total_results: 0 },
      { status: 200, headers: jsonCacheHeaders(SEARCH_CACHE_SECONDS) },
    );
  }
}
