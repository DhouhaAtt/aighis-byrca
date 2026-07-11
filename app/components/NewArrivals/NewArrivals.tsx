"use client";

import { useMemo, useState } from "react";
import styles from "./NewArrivals.module.css";

import { allProducts } from "./products";

// Components (coming in Part 2)
import SectionHeader from "../SectionHeader/SectionHeader";
import ProductCarousel from "../ProductCarousel/ProductCarousel";

export default function NewArrivals() {
  const [tab, setTab] = useState<"women" | "men">("women");

  const products = useMemo(
    () => allProducts.filter((p) => p.gender === tab),
    [tab]
  );

  return (
    <section className={styles.section}>
      <div className={styles.luxuryContainer}>
        <SectionHeader tab={tab} setTab={setTab} />

        <div className={styles.fadeIn}>
          <ProductCarousel products={products} />
        </div>
      </div>
    </section>
  );
}
