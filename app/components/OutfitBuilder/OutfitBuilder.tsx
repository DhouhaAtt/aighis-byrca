"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

import styles from "./OutfitBuilder.module.css";

export default function OutfitBuilder() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <span className={styles.overline}>Styled for you</span>
          <h2 className={styles.title}>
            Let Us Prepare<br />Your Outfit
          </h2>
          <p className={styles.subtitle}>
            Tell us your mood, your event, your favorite colors and let us
            craft a complete look that speaks to who you are.
          </p>
          <Link href="#" className={styles.ctaButton}>
            <Sparkles size={16} strokeWidth={1.5} />
            Prepare My Outfit
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
