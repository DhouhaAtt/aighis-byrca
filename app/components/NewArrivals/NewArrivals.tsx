"use client";

import { useMemo, useState } from "react";
import styles from "./NewArrivals.module.css";

import type { Product } from "./products";

// Components (coming in Part 2)
import SectionHeader from "../SectionHeader/SectionHeader";
import ProductCarousel from "../ProductCarousel/ProductCarousel";

interface Props {
  products: Product[];
}

export default function NewArrivals({ products }: Props) {
  const [tab, setTab] = useState<"women" | "men">("women");

  const tabProducts = useMemo(
    () => products.filter((p) => p.gender === tab || p.gender === "unisex"),
    [products, tab]
  );

  return (
    <section className={styles.section}>
      <div className={styles.luxuryContainer}>
        <SectionHeader tab={tab} setTab={setTab} />

        <div className={styles.fadeIn}>
          {tabProducts.length === 0 ? (
            <p className={styles.empty}>No new arrivals in this section yet.</p>
          ) : (
            <ProductCarousel products={tabProducts} />
          )}
        </div>
      </div>
    </section>
  );
}