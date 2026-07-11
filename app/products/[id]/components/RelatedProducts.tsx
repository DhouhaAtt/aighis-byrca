import Link from "next/link";

import ProductCard from "../../../components/ProductCard/ProductCard";
import type { Product } from "../../../components/NewArrivals/products";

import styles from "./RelatedProducts.module.css";

interface Props {
  products: Product[];
  title: string;
}

export default function RelatedProducts({ products, title }: Props) {
  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.grid}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className={styles.cardLink}
          >
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </section>
  );
}
