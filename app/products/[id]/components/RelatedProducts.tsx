
"use client";

import ProductCard from "../../../components/ProductCard/ProductCard";
import type { Product } from "../../../components/NewArrivals/products";

import styles from "./RelatedProducts.module.css";
import { useLocale } from "../../../context/LocaleContext";

interface Props {
  products: Product[];
  title?: string;
}

export default function RelatedProducts({ products, title }: Props) {
  const { t } = useLocale();
  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title ?? t.products.completeLook}</h2>

      <div className={styles.grid}>
        {products.map((product) => (
          <div key={product.id} className={styles.cardLink}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
