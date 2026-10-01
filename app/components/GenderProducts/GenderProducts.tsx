"use client";

import PageHeader from "../PageHeader/PageHeader";
import ProductCard from "../ProductCard/ProductCard";
import type { Product } from "../NewArrivals/products";
import { useLocale } from "../../context/LocaleContext";

import styles from "./GenderProducts.module.css";

interface Props {
  gender: "women" | "men";
  products: Product[];
}

export default function GenderProducts({ gender, products }: Props) {
  const { t } = useLocale();
  const copy = gender === "women" ? t.womenPage : t.menPage;

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <main className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </main>
    </>
  );
}