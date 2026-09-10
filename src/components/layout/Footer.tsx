import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <div className={styles.wordmark}>CINESCOPE</div>
            <p className={styles.tagline}>Cinema lives here.</p>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Navigate</h4>
            <ul>
              <li><Link href="/movies">Browse</Link></li>
              <li><Link href="/movies?sort_by=popularity.desc">Trending</Link></li>
              <li><Link href="/movies?sort_by=primary_release_date.desc">Upcoming</Link></li>
              <li><Link href="/genre/18">Drama</Link></li>
              <li><Link href="/genre/27">Horror</Link></li>
            </ul>
          </div>

          <div className={`${styles.col} ${styles.attribution}`}>
            <h4 className={styles.colTitle}>Data</h4>
            <p>
              This product uses the TMDB API but is not endorsed or certified by TMDB.
              All film data, posters, and trailers are provided by{" "}
              <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
                The Movie Database
              </a>.
            </p>
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noreferrer"
              className={styles.tmdbLogo}
              aria-label="The Movie Database"
            >
              TMDB
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} CINESCOPE. All rights reserved.</span>
          <span>Designed for cinephiles, by cinephiles.</span>
        </div>
      </div>
    </footer>
  );
}
