import { NextResponse } from "next/server";
import { parseOptionalInt, parsePage, parseSortBy } from "@/lib/api-params";
import { jsonCacheHeaders } from "@/lib/cache-config";
import { discoverMovies } from "@/lib/tmdb";

export const revalidate = 86_400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));
  const sortBy = parseSortBy(searchParams.get("sort_by"));
  const genre = parseOptionalInt(searchParams.get("genre"), { min: 1, max: 99_999 });
  const year = parseOptionalInt(searchParams.get("year"), { min: 1900, max: 2100 });

  try {
    const data = await discoverMovies({
      page,
      sortBy,
      genre,
      primaryReleaseYear: year,
    });
    return NextResponse.json(data, { headers: jsonCacheHeaders() });
  } catch {
    return NextResponse.json(
      { page: 1, results: [], total_pages: 0, total_results: 0 },
      { status: 200, headers: jsonCacheHeaders() },
    );
  }
}
