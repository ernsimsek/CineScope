<div align="center">

# 🎬 CineScope

### *Cinema lives here.*

A cinematic film discovery platform. Browse trending movies, search the archives, and explore the canon — powered by [TMDB](https://www.themoviedb.org/).

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.45-1a1a2e)](https://orm.drizzle.team)

</div>

---

## Features

- **Hero Carousel** — Auto-rotating cinematic hero with backdrop, ratings, and quick info
- **Trending & Now Playing** — Horizontally scrollable movie rows with drag-to-scroll and keyboard navigation
- **Browse All Films** — Filterable by genre, sort order, and year with infinite scroll
- **Movie Detail Pages** — Full overview, stats dashboard, cast & crew, reviews, trailers, and streaming providers
- **Live Search** — Debounced search with instant results and URL-synced queries
- **Genre Explorer** — Visual genre tiles with backdrop images and movie counts
- **Where to Watch** — Region-selectable streaming availability (US, GB, TR)
- **Trailer Modal** — Embedded YouTube player with focus trap and keyboard support
- **Demo Mode** — Full UI renders without a TMDB API key using deterministic mock data
- **SEO Optimized** — Dynamic sitemap, robots.txt, OpenGraph metadata, and semantic HTML

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, ISR) |
| Language | TypeScript 5.9 (strict mode) |
| Styling | Tailwind CSS 4.1 + CSS Modules |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| External API | TMDB API v3 / v4 |
| Fonts | Bebas Neue, DM Sans, DM Mono |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A [TMDB API key](https://www.themoviedb.org/settings/api) (optional — demo mode works without one)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/CineScope.git
cd CineScope

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db

# TMDB API — get yours at https://www.themoviedb.org/settings/api
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
TMDB_API_READ_TOKEN=your_read_access_token_here

NEXT_PUBLIC_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
TMDB_API_BASE=https://api.themoviedb.org/3
```

> **No API key?** The app automatically falls back to a built-in demo dataset with 50 fictional movies, cast data, and watch providers — perfect for development and preview.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
npm run build
npm run start
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── page.tsx            # Home page
│   ├── movies/             # Browse & movie detail pages
│   ├── search/             # Search page
│   ├── genre/[id]/         # Genre page
│   └── api/                # API route handlers
├── components/
│   ├── home/               # Hero, MovieRow, UpcomingGrid, GenreExplorer
│   ├── layout/             # Navbar, Footer
│   ├── movies/             # MovieCard, MovieHero, CastRow, Reviews, etc.
│   └── ui/                 # ScrollReveal, RatingBadge, Loading
├── db/                     # Drizzle ORM setup & schema
└── lib/
    ├── tmdb.ts             # TMDB API service + demo/mock system
    └── utils.ts            # Formatting helpers
```

## Design

CineScope features a **film-noir / brutalist editorial** aesthetic:

- **Color palette** — Deep blacks (`#0a0a0a`), warm paper tones (`#e8e4dc`), and a signature orange-red accent (`#ff4d1c`)
- **Typography** — Bebas Neue for cinematic headlines, DM Sans for body text
- **Textures** — Subtle scanline overlays and film grain effects
- **Motion** — Scroll-reveal animations, hover transitions, reduced-motion support

## API Routes

| Route | Description |
|---|---|
| `GET /api/health` | Database health check |
| `GET /api/movies` | Proxy TMDB discover endpoint (genre, sort, year, page) |
| `GET /api/search` | Proxy TMDB search endpoint |

## License

This project uses data from [The Movie Database (TMDB)](https://www.themoviedb.org/) but is **not endorsed or certified by TMDB**.

---

<div align="center">

Built with Next.js, React, and a love for cinema.

</div>
