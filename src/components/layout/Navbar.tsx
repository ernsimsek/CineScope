"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useScrollHide } from "@/hooks/useScrollHide";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const navRef = useScrollHide<HTMLDivElement>(styles.hidden);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = String(formData.get("q") ?? "").trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <nav ref={navRef} className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.brand} aria-label="Cinescope home">
            <span className={styles.brandMark} aria-hidden />
            <span>CINESCOPE</span>
          </Link>

          <div className={styles.links}>
            <Link href="/movies" className={styles.link}>
              Browse
            </Link>
            <Link href="/movies?sort_by=popularity.desc" className={styles.link}>
              Trending
            </Link>
            <Link href="/movies?sort_by=primary_release_date.desc" className={styles.link}>
              Genres
            </Link>
          </div>

          <div className={styles.right}>
            <button
              type="button"
              className={styles.searchToggle}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              )}
            </button>
            <button type="button" className={styles.signIn}>
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className={styles.searchPanel}>
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 720 }}>
            <input
              ref={inputRef}
              type="text"
              name="q"
              className={styles.searchInput}
              placeholder="Search the archives…"
              autoComplete="off"
            />
          </form>
        </div>
      )}
    </>
  );
}
