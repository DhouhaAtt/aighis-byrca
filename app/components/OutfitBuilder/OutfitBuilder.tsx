"use client";

"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

import styles from "./OutfitBuilder.module.css";
import { useLocale } from "../../context/LocaleContext";

export default function OutfitBuilder() {
  const { t } = useLocale();
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <span className={styles.overline}>{t.home.outfitEyebrow}</span>
          <h2 className={styles.title}>
            {t.home.outfitTitle}
          </h2>
          <p className={styles.subtitle}>
            {t.home.outfitDescription}
          </p>
          <Link href="/outfit-builder" className={styles.ctaButton}>
            <Sparkles size={16} strokeWidth={1.5} />
            {t.home.outfitCta}
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
