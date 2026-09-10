"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useScrollHide } from "@/hooks/useScrollHide";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/movies", label: "Browse" },
  { href: "/movies?sort_by=popularity.desc", label: "Trending" },
  { href: "/#genres", label: "Genres" },
] as const;

export default function Navbar() {
  const router = useRouter();
  const navRef = useScrollHide<HTMLDivElement>(styles.hidden);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = String(formData.get("q") ?? "").trim();
    if (!q) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav ref={navRef} className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.brand} aria-label="Cinescope home" onClick={closeMenu}>
            <span className={styles.brandMark} aria-hidden />
            <span>CINESCOPE</span>
          </Link>

          <div className={styles.links}>
            {NAV_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className={styles.right}>
            <button
              type="button"
              className={styles.searchToggle}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              onClick={() => {
                setSearchOpen((v) => !v);
                setMenuOpen(false);
              }}
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

            <button
              type="button"
              className={styles.menuToggle}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => {
                setMenuOpen((v) => !v);
                setSearchOpen(false);
              }}
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>

            <span className={styles.signIn} title="Coming soon">
              Sign in
            </span>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className={styles.searchPanel}>
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 720 }}>
            <input
              ref={inputRef}
              type="search"
              name="q"
              className={styles.searchInput}
              placeholder="Search the archives…"
              autoComplete="off"
              enterKeyHint="search"
            />
          </form>
        </div>
      )}

      <div
        id="mobile-nav"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
        />
        <div className={styles.mobilePanel}>
          <nav className={styles.mobileLinks} aria-label="Mobile">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.mobileLink}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/search" className={styles.mobileLink} onClick={closeMenu}>
              Search
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
