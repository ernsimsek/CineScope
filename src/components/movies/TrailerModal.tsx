"use client";

import { useEffect, useRef } from "react";
import styles from "./TrailerModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  videoKey: string | null;
  title?: string;
};

export default function TrailerModal({ open, onClose, videoKey, title }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Focus trap
      if (e.key === "Tab" && closeBtnRef.current) {
        e.preventDefault();
        closeBtnRef.current.focus();
      }
    };

    // Prevent body scroll while open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Trailer for ${title ?? "film"}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <span className={styles.title}>{title ?? "Trailer"}</span>
      <button
        ref={closeBtnRef}
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label="Close trailer"
      >
        ×
      </button>
      <div className={styles.modal}>
        {videoKey ? (
          <iframe
            className={styles.iframe}
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
            title={`${title ?? "Trailer"} — YouTube`}
            allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-mercury)", fontFamily: "var(--font-mono)", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "13px" }}>
            Trailer unavailable
          </div>
        )}
      </div>
    </div>
  );
}
