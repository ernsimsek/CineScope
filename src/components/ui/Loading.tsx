import styles from "./Loading.module.css";

export function LoadingSpinner({ label = "Loading the reel…" }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className={styles.skeletonGrid} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonPoster} />
          <div className={styles.skeletonLine} />
          <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
        </div>
      ))}
    </div>
  );
}
