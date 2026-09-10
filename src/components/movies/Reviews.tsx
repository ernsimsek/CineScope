import type { TmdbReview } from "@/lib/tmdb";
import { formatDate } from "@/lib/utils";
import styles from "./Reviews.module.css";

type Props = {
  reviews: TmdbReview[];
};

function initial(name: string): string {
  return name?.trim()?.[0]?.toUpperCase() ?? "?";
}

export default function Reviews({ reviews }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Critics & Reviews</h2>
        <span className={styles.count}>
          {reviews.length > 0 ? `${reviews.length} featured` : ""}
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className={styles.empty}>No reviews yet.</div>
      ) : (
        <div className={styles.list}>
          {reviews.map((r, i) => {
            const rating = r.author_details?.rating;
            return (
              <article
                // TMDB review ids are unique within a page; append index for
                // absolute safety in edge cases.
                key={`${r.id}-${i}`}
                className={styles.review}
              >
                <div className={styles.reviewHeader}>
                  <span className={styles.avatar} aria-hidden>
                    {initial(r.author)}
                  </span>
                  <div>
                    <div className={styles.author}>{r.author}</div>
                    {r.username && r.username !== r.author ? (
                      <div className={styles.username}>@{r.username}</div>
                    ) : null}
                  </div>
                  {rating !== undefined && rating !== null ? (
                    <span className={styles.ratingBadge}>
                      <svg viewBox="0 0 24 24" aria-hidden>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {rating}/10
                    </span>
                  ) : null}
                </div>
                <p className={styles.content}>{r.content}</p>
                <div className={styles.meta}>
                  Written {formatDate(r.created_at)}
                  {r.url ? (
                    <>
                      {" · "}
                      <a href={r.url} target="_blank" rel="noreferrer">
                        read original
                      </a>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
