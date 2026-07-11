"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./GenderSection.module.css";
import { genderData } from "./genderData";
import { useLocale } from "../../context/LocaleContext";

export default function GenderSection() {
  const { t } = useLocale();

  const titles: Record<number, string> = {
    1: t.home.women,
    2: t.home.men,
  };

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {genderData.map((item) => (
          <article key={item.id} className={styles.card}>
            <Link href={item.href} className={styles.imageWrapper}>
              <Image
                src={item.image}
                alt={titles[item.id] || item.title}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
                className={styles.image}
              />

              <div className={styles.content}>
                <h2>{titles[item.id]}</h2>

                <span className={styles.button}>
                  {t.home.shopNow}
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
