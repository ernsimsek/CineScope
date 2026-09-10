import { NextResponse } from "next/server";
import { discoverMovies } from "@/lib/tmdb";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const sortBy = searchParams.get("sort_by") ?? "popularity.desc";
  const genre = searchParams.get("genre");
  const year = searchParams.get("year");

  try {
    const data = await discoverMovies({
      page,
      sortBy,
      genre: genre ? Number(genre) : undefined,
      primaryReleaseYear: year ? Number(year) : undefined,
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { page: 1, results: [], total_pages: 0, total_results: 0 },
      { status: 200 },
    );
  }
}
