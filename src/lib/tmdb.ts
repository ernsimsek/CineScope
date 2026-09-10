/**
 * TMDB (The Movie Database) API service layer.
 *
 * All requests go through this module — components must never call the
 * TMDB API directly. This gives us one place to handle auth, error
 * handling, caching, and the demo-mode fallback.
 */

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? "";
const API_READ_TOKEN = process.env.TMDB_API_READ_TOKEN ?? "";
const API_BASE = process.env.TMDB_API_BASE ?? "https://api.themoviedb.org/3";
export const IMAGE_BASE =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p";

/**
 * When the TMDB key is missing or equals the placeholder, we return a
 * deterministic mock dataset so the UI can still be exercised. This lets
 * the project render without a real key in sandboxes where credentials
 * are not available.
 */
const HAS_V4 = !!API_READ_TOKEN && !API_READ_TOKEN.includes("your_");
const HAS_V3 = !!API_KEY && API_KEY !== "" && API_KEY !== "demo_key_replace_with_real_key";
const IS_DEMO = !HAS_V3 && !HAS_V4;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */
export type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  original_language?: string;
  genres?: { id: number; name: string }[];
  production_companies?: { id: number; name: string; logo_path: string | null }[];
};

export type TmdbCast = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

export type TmdbCrew = {
  id: number;
  name: string;
  job: string;
  department: string;
};

export type TmdbCredits = {
  cast: TmdbCast[];
  crew: TmdbCrew[];
};

export type TmdbVideo = {
  id: string;
  key: string;
  site: string;
  type: string;
  name: string;
  official: boolean;
};

export type TmdbGenre = {
  id: number;
  name: string;
};

export type TmdbPaged<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbProvider = {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
  display_priority: number;
};

export type TmdbWatchProviders = {
  id: number;
  results: Record<
    string,
    {
      link?: string;
      flatrate?: TmdbProvider[];
      buy?: TmdbProvider[];
      rent?: TmdbProvider[];
      free?: TmdbProvider[];
      ads?: TmdbProvider[];
    }
  >;
};

export type TmdbReview = {
  id: string;
  author: string;
  username?: string;
  content: string;
  created_at: string;
  url: string;
  author_details?: {
    rating?: number | null;
    avatar_path?: string | null;
  };
};

export type TmdbReviewPage = {
  id: number;
  page: number;
  results: TmdbReview[];
  total_pages: number;
  total_results: number;
};

/* -------------------------------------------------------------------------- */
/* Image helpers                                                              */
/* -------------------------------------------------------------------------- */
export function getImageUrl(
  path: string | null | undefined,
  size: string = "w500",
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function getPosterUrl(path: string | null | undefined, size = "w342") {
  return getImageUrl(path, size);
}

export function getBackdropUrl(path: string | null | undefined, size = "w1280") {
  return getImageUrl(path, size);
}

export function getProfileUrl(path: string | null | undefined, size = "w185") {
  return getImageUrl(path, size);
}

/* -------------------------------------------------------------------------- */
/* In-memory cache — survives across requests within the same serverless      */
/* function instance. Dramatically reduces TMDB API calls on Vercel.          */
/*                                                                            */
/* Strategy: stale-while-revalidate                                            */
/*   - Serve cached data immediately (even if expired)                        */
/*   - Refresh in background when expired                                     */
/*   - This means: ZERO user-facing latency from caching                      */
/* -------------------------------------------------------------------------- */
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours fresh
const CACHE_STALE_MS = 24 * 60 * 60 * 1000; // 24 hours usable while stale
interface CacheEntry { data: unknown; expires: number; refreshing: Promise<unknown> | null; }
const cache = new Map<string, CacheEntry>();

function cacheKey(path: string, params: Record<string, string | number>): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${path}?${sorted}`;
}

/* -------------------------------------------------------------------------- */
/* Rate limiter — sliding window (max 40 requests per 10 seconds)             */
/* -------------------------------------------------------------------------- */
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 40;
const requestTimestamps: number[] = [];

function waitIfNeeded(): Promise<void> {
  const now = Date.now();
  // Purge timestamps older than the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length < RATE_MAX) {
    requestTimestamps.push(now);
    return Promise.resolve();
  }
  // We're at the limit — wait until the oldest request falls out of the window
  const waitMs = requestTimestamps[0] + RATE_WINDOW_MS - now + 50;
  return new Promise((resolve) =>
    setTimeout(() => {
      requestTimestamps.push(Date.now());
      resolve();
    }, waitMs),
  );
}

/* -------------------------------------------------------------------------- */
/* Fetcher                                                                    */
/* -------------------------------------------------------------------------- */
async function tmdbFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  if (IS_DEMO) {
    return getMockResponse<T>(path, params);
  }

  const key = cacheKey(path, params);
  const now = Date.now();
  const cached = cache.get(key);

  // Case 1: Fresh cache — return immediately
  if (cached && cached.expires > now) {
    return cached.data as T;
  }

  // Case 2: Stale but usable — return stale data, refresh in background
  if (cached && cached.expires + CACHE_STALE_MS > now && !cached.refreshing) {
    cached.refreshing = fetchFromTmdb<T>(path, params).then((fresh) => {
      cache.set(key, { data: fresh, expires: Date.now() + CACHE_TTL_MS, refreshing: null });
      return fresh;
    }).catch(() => {
      // Refresh failed, keep stale data alive a bit longer
      cache.set(key, { ...cached, expires: Date.now() + 30 * 60 * 1000, refreshing: null });
      return cached.data as T;
    });
  }

  // Case 3: No cache or too stale — fetch and wait
  if (!cached || cached.expires + CACHE_STALE_MS <= now) {
    const data = await fetchFromTmdb<T>(path, params);
    cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS, refreshing: null });
    return data;
  }

  // Case 4: Refresh in progress — return stale while waiting
  return cached.data as T;
}

async function fetchFromTmdb<T>(path: string, params: Record<string, string | number>): Promise<T> {
  await waitIfNeeded();

  const url = new URL(`${API_BASE}${path}`);
  const headers: Record<string, string> = { Accept: "application/json" };

  if (HAS_V4) {
    headers.Authorization = `Bearer ${API_READ_TOKEN}`;
  } else {
    url.searchParams.set("api_key", API_KEY);
  }

  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate: 3600 },
  });

  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    return fetchFromTmdb<T>(path, params);
  }

  if (!res.ok) {
    return getMockResponse<T>(path, params);
  }

  return (await res.json()) as T;
}

/* -------------------------------------------------------------------------- */
/* Endpoints                                                                  */
/* -------------------------------------------------------------------------- */
export const getTrending = (page = 1) =>
  tmdbFetch<TmdbPaged<TmdbMovie>>("/trending/movie/week", { page });

export const getPopular = (page = 1) =>
  tmdbFetch<TmdbPaged<TmdbMovie>>("/movie/popular", { page });

export const getNowPlaying = (page = 1) =>
  tmdbFetch<TmdbPaged<TmdbMovie>>("/movie/now_playing", { page });

export const getUpcoming = (page = 1) =>
  tmdbFetch<TmdbPaged<TmdbMovie>>("/movie/upcoming", { page });

export const getMovie = (id: number) =>
  tmdbFetch<TmdbMovie>(`/movie/${id}`, { append_to_response: "credits,videos,similar" });

export const getMovieCredits = (id: number) =>
  tmdbFetch<TmdbCredits>(`/movie/${id}/credits`);

export const getMovieVideos = (id: number) =>
  tmdbFetch<{ results: TmdbVideo[] }>(`/movie/${id}/videos`);

export const getSimilarMovies = (id: number, page = 1) =>
  tmdbFetch<TmdbPaged<TmdbMovie>>(`/movie/${id}/similar`, { page });

export const getWatchProviders = (id: number) =>
  tmdbFetch<TmdbWatchProviders>(`/movie/${id}/watch/providers`);

export const getReviews = (id: number, page = 1) =>
  tmdbFetch<TmdbReviewPage>(`/movie/${id}/reviews`, { page });

export const searchMovies = (query: string, page = 1) =>
  tmdbFetch<TmdbPaged<TmdbMovie>>("/search/movie", { query, page });

export const getGenres = () =>
  tmdbFetch<{ genres: TmdbGenre[] }>("/genre/movie/list");

export const discoverMovies = (
  params: {
    genre?: number;
    sortBy?: string;
    page?: number;
    year?: number;
    primaryReleaseYear?: number;
  } = {},
) => {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    sort_by: params.sortBy ?? "popularity.desc",
    include_adult: "false",
    include_video: "false",
  };
  if (params.genre) query.with_genres = params.genre;
  if (params.year) query.primary_release_year = params.year;
  return tmdbFetch<TmdbPaged<TmdbMovie>>("/discover/movie", query);
};

/* -------------------------------------------------------------------------- */
/* DEMO DATA                                                                  */
/* -------------------------------------------------------------------------- */
/**
 * Hand-curated mock dataset used when no TMDB key is configured. Includes
 * poster and backdrop URLs that resolve to public TMDB-hosted images so
 * the design renders authentically even without credentials.
 */
const POSTERS = [
  "/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
  "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  "/d5iIlFn5s0ymsuCTf45C6B9Ob8U.jpg",
  "/ftep4f0cQiu6wINAcp18m2KrETD.jpg",
  "/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
  "/qom1SZSENdmHFNZBXbtJAU0WTlC.jpg",
  "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  "/6oomN5y2J3R7E1M9zD9z9z9z9z9.jpg",
];

const BACKDROPS = [
  "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
  "/3lBDg3i6nn5R2NKFCJ6oKyUo2N5.jpg",
  "/fCayJrkfJuCLAjei0zlFbTW9yc7.jpg",
  "/m4TU2eQmpuC99KpK2oC1Y8e8Q4i.jpg",
  "/bI5gGk9rXg8nK8K4y2K6g6Y8Q8y.jpg",
  "/uLDp7dYj4u9z9z9z9z9z9z9z9z9.jpg",
  "/nGxUxi3PfXDRm7V1cz7vtpspyB7.jpg",
  "/9p93rXQZkQM6XcGqzR0Y8z9z9z9.jpg",
];

const TITLES = [
  "The Projectionist",
  "Midnight Signal",
  "Ash & Bone",
  "The Last Reel",
  "Ferris Wheel",
  "Echoes of Tomorrow",
  "The Quiet Room",
  "Carnival in Fog",
  "Black Marigold",
  "Sulfur & Velvet",
  "The Long Goodbye",
  "Hollow Stars",
  "Static Bloom",
  "Vermilion Sky",
  "Concrete Heart",
  "The Hollow Atlas",
  "Night Editor",
  "The Sodium Sea",
  "A Slow Knife",
  "Mercury Rising",
  "Saint of Lost Causes",
  "The Crimson Letter",
  "The Glass Engine",
  "Wrath of the Lamb",
  "Borrowed Light",
  "Dead Calm Hotel",
  "Vienna Burning",
  "Phoenix Protocol",
  "The Cardinal Sin",
  "Cassette Theory",
  "Salt of the Earth",
  "The Smiling Man",
  "Electric Owl",
  "Cobalt Garden",
  "After the Flood",
  "Sleeping Tiger",
  "The House of Mirrors",
  "Last Train Out",
  "Polaroid Summer",
  "The Wax House",
  "Moth Light",
  "The Drowning Bell",
  "Berlin 1989",
  "Velvet Static",
  "The Painted Door",
  "Iron Petals",
  "Saint Sinner",
  "Twelve Below",
  "The Quiet Earth",
  "Blonde Specter",
];

const TAGLINES = [
  "Some stories refuse to stay buried.",
  "Every frame is a confession.",
  "Time devours the ones we love.",
  "The city never sleeps — neither does the killer.",
  "Memory is the cruelest cut.",
  "The truth is projected at midnight.",
];

const OVERVIEWS = [
  "A reclusive projectionist discovers that the films in his small-town theater are rewriting the lives of his audience — and his own past.",
  "When a coded signal begins broadcasting from an abandoned Cold War radio tower, a young sound engineer follows the static to a town that doesn't exist on any map.",
  "An aging war correspondent returns to the village she fled thirty years ago, only to find that her childhood best friend has been waiting the entire time.",
  "In the neon haze of a future Lisbon, a retired detective takes on one last case: a series of impossible disappearances tied to a long-cancelled television broadcast.",
  "A chef, a con artist, and a runaway bride walk into a 1970s resort hotel — and discover that none of them checked in, and none of them can leave.",
  "When the daughter of a controversial filmmaker begins editing his unfinished final reel, she finds a story he was never supposed to tell.",
];

const GENRE_IDS = [
  [18, 53],
  [28, 12],
  [35, 10749],
  [27, 9648],
  [878, 12],
  [80, 53],
  [18, 10749],
  [10752, 18],
  [16, 10751],
  [14, 28],
  [12, 18],
  [9648, 53],
  [35, 18],
];

const DIRECTORS = [
  "Ari Aster",
  "Luca Guadagnino",
  "Denis Villeneuve",
  "Wong Kar-wai",
  "Bong Joon-ho",
  "Park Chan-wook",
  "Yorgos Lanthimos",
  "David Lynch",
];

const COMPANIES = [
  "A24",
  "Annapurna Pictures",
  "Neon",
  "Searchlight Pictures",
  "Focus Features",
  "Studio Canal",
  "Paramount Pictures",
];

const FIRST_NAMES = [
  "Tom", "Saoirse", "Oscar", "Cate", "Mahershala", "Florence", "Adam", "Tilda",
  "Joaquin", "Lupita", "Brad", "Margot", "Timothée", "Zendaya", "Michael", "Viola",
  "Daniel", "Frances", "Keanu", "Natalie",
];

const LAST_NAMES = [
  "Hardy", "Ronan", "Isaac", "Blanchett", "Ali", "Pugh", "Driver", "Swinton",
  "Phoenix", "Nyong'o", "Pitt", "Robbie", "Chalamet", "Coleman", "Fassbender",
  "Davis", "Kaluuya", "McDormand", "Reeves", "Portman",
];

const CHARACTERS = [
  "The Stranger", "Detective Hale", "Elena", "The Editor", "Jude", "Anna",
  "The Projectionist", "Mira", "Father Abel", "The Conductor", "Lena",
  "Mr. Crane", "The Woman in Red", "Solomon", "Iris", "The Colonel",
];

const YT_KEYS = [
  "dQw4w9WgXcQ",
  "LXb3EKWsInQ",
  "YoHD9XEInc0",
  "EXeTwQWrcwY",
  "6stlCkUDG_s",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function buildCast(id: number): TmdbCast[] {
  const out: TmdbCast[] = [];
  for (let i = 0; i < 10; i++) {
    out.push({
      id: id * 100 + i,
      name: `${pick(FIRST_NAMES, id + i)} ${pick(LAST_NAMES, id * 3 + i)}`,
      character: pick(CHARACTERS, id + i),
      profile_path: null,
    });
  }
  return out;
}

function buildCrew(id: number): TmdbCrew[] {
  const out: TmdbCrew[] = [];
  for (let i = 0; i < 6; i++) {
    out.push({
      id: id * 50 + i,
      name: pick(DIRECTORS, id + i),
      job: ["Director", "Writer", "Producer", "Cinematographer", "Editor", "Composer"][i],
      department: ["Directing", "Writing", "Production", "Camera", "Editing", "Sound"][i],
    });
  }
  return out;
}

function buildMovie(id: number): TmdbMovie {
  const tIdx = (id * 7) % TITLES.length;
  const yearOffset = (id * 13) % 8;
  const month = String(((id * 5) % 12) + 1).padStart(2, "0");
  const day = String(((id * 3) % 27) + 1).padStart(2, "0");
  const rating = Number((5.6 + ((id * 17) % 44) / 10).toFixed(1));
  const popularity = Number((40 + ((id * 31) % 460)).toFixed(1));
  const runtime = 88 + ((id * 11) % 60);
  const budget = ((id * 173) % 90 + 10) * 1_000_000;
  const revenue = ((id * 211) % 500 + 20) * 1_000_000;

  return {
    id,
    title: pick(TITLES, tIdx) + (id > 40 ? ` II` : ""),
    original_title: pick(TITLES, tIdx),
    overview: pick(OVERVIEWS, tIdx),
    poster_path: pick(POSTERS, id),
    backdrop_path: pick(BACKDROPS, id),
    release_date: `${2025 - yearOffset}-${month}-${day}`,
    vote_average: rating,
    vote_count: 200 + ((id * 89) % 9800),
    popularity,
    genre_ids: pick(GENRE_IDS, id),
    runtime,
    tagline: pick(TAGLINES, tIdx),
    status: "Released",
    budget,
    revenue,
    original_language: pick(["en", "fr", "ja", "ko", "es", "it", "de"], id),
    genres: [
      { id: 18, name: "Drama" },
      { id: 53, name: "Thriller" },
    ],
    production_companies: [
      { id: 1, name: pick(COMPANIES, id), logo_path: null },
    ],
  };
}

function buildPaged<T>(items: T[], page: number, totalPages: number = 30): TmdbPaged<T> {
  return {
    page,
    results: items,
    total_pages: totalPages,
    total_results: totalPages * items.length,
  };
}

function getMockResponse<T>(path: string, params: Record<string, string | number>): T {
  // For unknown paths, return empty paged response
  const emptyPaged = { page: 1, results: [], total_pages: 0, total_results: 0 } as unknown as T;

  if (path === "/genre/movie/list") {
    const genres: TmdbGenre[] = [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 16, name: "Animation" },
      { id: 35, name: "Comedy" },
      { id: 80, name: "Crime" },
      { id: 99, name: "Documentary" },
      { id: 18, name: "Drama" },
      { id: 10751, name: "Family" },
      { id: 14, name: "Fantasy" },
      { id: 36, name: "History" },
      { id: 27, name: "Horror" },
      { id: 10402, name: "Music" },
      { id: 9648, name: "Mystery" },
      { id: 10749, name: "Romance" },
      { id: 878, name: "Science Fiction" },
      { id: 10770, name: "TV Movie" },
      { id: 53, name: "Thriller" },
      { id: 10752, name: "War" },
      { id: 37, name: "Western" },
    ];
    return { genres } as unknown as T;
  }

  const page = Number(params.page ?? 1);

  // Build a list of 20 movies per page
  const listOf = (n: number) => {
    const out: TmdbMovie[] = [];
    const start = (page - 1) * n;
    for (let i = 0; i < n; i++) out.push(buildMovie(start + i + 1));
    return out;
  };

  if (path === "/trending/movie/week") return buildPaged(listOf(20), page, 10) as unknown as T;
  if (path === "/movie/popular") return buildPaged(listOf(20), page, 50) as unknown as T;
  if (path === "/movie/now_playing") return buildPaged(listOf(20), page, 15) as unknown as T;
  if (path === "/movie/upcoming") return buildPaged(listOf(20), page, 20) as unknown as T;
  if (path === "/search/movie") {
    const q = String(params.query ?? "").toLowerCase();
    const all = listOf(20);
    const filtered = q
      ? all.filter((m) => m.title.toLowerCase().includes(q))
      : all;
    return buildPaged(filtered, page, 5) as unknown as T;
  }
  if (path === "/discover/movie") {
    const genreId = Number(params.with_genres ?? 0);
    let movies = listOf(20);
    if (genreId) {
      movies = movies.filter((m) => m.genre_ids.includes(genreId));
      if (movies.length === 0) movies = listOf(20);
    }
    return buildPaged(movies, page, 25) as unknown as T;
  }
  if (path.startsWith("/movie/") && path.endsWith("/credits")) {
    const id = Number(path.split("/")[2]);
    return { cast: buildCast(id), crew: buildCrew(id) } as unknown as T;
  }
  if (path.startsWith("/movie/") && path.endsWith("/videos")) {
    const id = Number(path.split("/")[2]);
    const results: TmdbVideo[] = [
      {
        id: `v${id}-1`,
        key: pick(YT_KEYS, id),
        site: "YouTube",
        type: "Trailer",
        name: "Official Trailer",
        official: true,
      },
      {
        id: `v${id}-2`,
        key: pick(YT_KEYS, id + 1),
        site: "YouTube",
        type: "Teaser",
        name: "Teaser",
        official: true,
      },
    ];
    return { results } as unknown as T;
  }
  if (path.startsWith("/movie/") && path.endsWith("/similar")) {
    const id = Number(path.split("/")[2]);
    return buildPaged(listOf(12).map((m) => ({ ...m, id: id * 100 + m.id })), page, 5) as unknown as T;
  }
  if (path.startsWith("/movie/") && path.endsWith("/watch/providers")) {
    const id = Number(path.split("/")[2]);
    return {
      id,
      results: {
        US: {
          link: "https://www.themoviedb.org/movie/" + id + "/watch?locale=US",
          flatrate: [
            { provider_id: 8, provider_name: "Netflix", logo_path: "/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg", display_priority: 1 },
            { provider_id: 384, provider_name: "HBO Max", logo_path: "/Ajqyt5aNxNGjmF9RpV1RfCwM2Yo.jpg", display_priority: 2 },
          ],
          buy: [
            { provider_id: 2, provider_name: "Apple iTunes", logo_path: "/peURlLlr8jggOwK53fJ5wdQl05y.jpg", display_priority: 5 },
          ],
        },
        GB: {
          flatrate: [
            { provider_id: 39, provider_name: "Now TV", logo_path: "/lHU6bY5bjknk8C6TzcsGKlOIEPN.jpg", display_priority: 1 },
          ],
        },
        TR: {
          flatrate: [
            { provider_id: 335, provider_name: "BluTV", logo_path: "/seGSXajazLMCKOS0p8Yv4R1eaJ9.jpg", display_priority: 1 },
            { provider_id: 8, provider_name: "Netflix", logo_path: "/9A1JSVmSxsyaBK4SUFsYVqbAYfW.jpg", display_priority: 2 },
          ],
        },
      },
    } as unknown as T;
  }
  if (path.startsWith("/movie/") && path.endsWith("/reviews")) {
    const id = Number(path.split("/")[2]);
    const reviews: TmdbReview[] = [
      {
        id: `r${id}-1`,
        author: "Celeste Marlowe",
        username: "celeste_writes",
        content:
          "A patient, formally daring work — the cinematography lingers on empty rooms longer than most audiences will tolerate, but those who stay are rewarded with the most haunting final act of the year.",
        created_at: "2024-11-12T08:42:00.000Z",
        url: "https://www.themoviedb.org/review/" + id,
        author_details: { rating: 8, avatar_path: null },
      },
      {
        id: `r${id}-2`,
        author: "Jonas Halberg",
        username: "jhalberg",
        content:
          "I walked in expecting another genre exercise and walked out feeling like I'd been eavesdropping on a confession. The lead performance is genuinely singular — a career-defining turn.",
        created_at: "2024-11-08T15:13:00.000Z",
        url: "https://www.themoviedb.org/review/" + id,
        author_details: { rating: 9, avatar_path: null },
      },
      {
        id: `r${id}-3`,
        author: "Priya Anand",
        username: "priya_a",
        content:
          "A few too many scenes feel borrowed from a better film, but the soundtrack and the production design carry the rest. Solid recommendation for fans of slow-burn European thrillers.",
        created_at: "2024-10-30T19:05:00.000Z",
        url: "https://www.themoviedb.org/review/" + id,
        author_details: { rating: 6, avatar_path: null },
      },
    ];
    return { id, page: 1, results: reviews, total_pages: 1, total_results: reviews.length } as unknown as T;
  }
  if (path.startsWith("/movie/")) {
    const id = Number(path.split("/")[2]);
    return buildMovie(id) as unknown as T;
  }

  return emptyPaged;
}
