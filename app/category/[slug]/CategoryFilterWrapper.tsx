"use client";

import ProductFilterLayout from "../../components/ProductFilterLayout/ProductFilterLayout";
import type { Product } from "../../components/NewArrivals/products";
import PageHeader from "../../components/PageHeader/PageHeader";
import Link from "next/link";
import { useLocale } from "../../context/LocaleContext";
import styles from "./CategoryPage.module.css";

interface Props {
  products: Product[];
  titleEn: string;
  titleFr: string;
  subtitleEn?: string;
  subtitleFr?: string;
}

export default function CategoryFilterWrapper({ products, titleEn, titleFr, subtitleEn, subtitleFr }: Props) {
  const { locale } = useLocale();
  const isFrench = locale === "fr";

  return (
    <>
      <PageHeader title={isFrench ? titleFr : titleEn} subtitle={isFrench ? subtitleFr : subtitleEn} />
      {products.length === 0 ? (
        <main className={styles.empty}>
          <p>{isFrench ? "Aucun produit dans cette catégorie." : "No products found in this category."}</p>
          <Link href="/products" className={styles.back}>{isFrench ? "Voir tous les produits" : "View all products"}</Link>
        </main>
      ) : <ProductFilterLayout products={products} />}
    </>
  );
}
