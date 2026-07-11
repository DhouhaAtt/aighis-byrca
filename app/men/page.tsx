"use client";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import ProductCard from "../components/ProductCard/ProductCard";
import { menProducts } from "../components/NewArrivals/products";
import { useLocale } from "../context/LocaleContext";

import styles from "./CategoryPage.module.css";

export default function MenPage() {
  const { t } = useLocale();

  return (
    <>
      <Navbar compact />
      <PageHeader title={t.menPage.title} subtitle={t.menPage.subtitle} />
      <main className={styles.grid}>
        {menProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </main>
      <Footer />
    </>
  );
}
