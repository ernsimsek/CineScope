import Image from "next/image";
import type { TmdbCast } from "@/lib/tmdb";
import { getProfileUrl } from "@/lib/tmdb-images";
import styles from "./CastRow.module.css";

type Props = {
  cast: TmdbCast[];
  title?: string;
};

export default function CastRow({ cast, title = "Cast" }: Props) {
  if (!cast || cast.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.row}>
        {cast.slice(0, 15).map((person) => {
          const profile = getProfileUrl(person.profile_path, "w185");
          const initial = person.name?.[0] ?? "?";
          return (
            <div key={person.id} className={styles.member}>
              <div className={styles.avatar}>
                {profile ? (
                  <Image
                    src={profile}
                    alt={person.name}
                    fill
                    sizes="100px"
                  />
                ) : (
                  <span className={styles.noAvatar}>{initial}</span>
                )}
              </div>
              <div className={styles.name}>{person.name}</div>
              <div className={styles.character}>{person.character}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
