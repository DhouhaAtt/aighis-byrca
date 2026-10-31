"use client";

import Image from "next/image";
import styles from "./AboutSection.module.css";
import { useLocale } from "../../context/LocaleContext";

export default function AboutSection() {
  const { t } = useLocale();
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div className={styles.imageCol}>
          <div className={styles.imageWrap}>
            <Image
              src="/assets/aighis_byrca_sea.png"
              alt="Aighis Byrca"
              fill
              className={styles.image}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className={styles.textCol}>
          <h2 className={styles.heading}>
            {t.home.aboutTitle}
          </h2>

          {t.home.aboutParagraphs.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
