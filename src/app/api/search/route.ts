import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  try {
    const data = q
      ? await searchMovies(q, page)
      : { page: 1, results: [], total_pages: 0, total_results: 0 };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { page: 1, results: [], total_pages: 0, total_results: 0 },
      { status: 200 },
    );
  }
}
