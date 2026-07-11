"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import styles from "./CategoriesSection.module.css";
import { categories } from "./categoriesData";
import { useLocale } from "../../context/LocaleContext";

export default function CategoriesSection() {
  const { t } = useLocale();

  const titles: Record<number, string> = {
    1: t.categories.tops,
    2: t.categories.bottoms,
    3: t.categories.underwear,
    4: t.categories.bags,
  };

  const subtitles: Record<number, string> = {
    1: t.categories.springSummer,
    2: t.categories.springSummer,
    3: t.categories.intimate,
    4: t.categories.signature,
  };

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {categories.map((category) => (
          <article key={category.id} className={styles.card}>
            <Link href={category.href} className={styles.link}>
              <div className={styles.imageWrapper}>
                <Image
                  src={category.image}
                  alt={titles[category.id]}
                  fill
                  className={styles.image}
                />
              </div>

              <div className={styles.overlay} />

              <div className={styles.content}>
                <h2 className={styles.title}>{titles[category.id]}</h2>

                <span className={styles.action}>
                  {t.home.discover}
                  <ArrowRight size={14} strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
