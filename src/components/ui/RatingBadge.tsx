import styles from "./RatingBadge.module.css";
import { formatRating } from "@/lib/utils";

type Props = {
  value: number;
  size?: "default" | "large";
};

export default function RatingBadge({ value, size = "default" }: Props) {
  return (
    <span
      className={`${styles.badge} ${size === "large" ? styles.large : ""}`}
      aria-label={`TMDB rating ${formatRating(value)} out of 10`}
    >
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className={styles.value}>{formatRating(value)}</span>
      <span className={styles.max}>/10</span>
    </span>
  );
}
