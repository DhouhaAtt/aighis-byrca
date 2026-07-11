"use client";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import ProductCard from "../components/ProductCard/ProductCard";
import { womenProducts } from "../components/NewArrivals/products";
import { useLocale } from "../context/LocaleContext";

import styles from "./CategoryPage.module.css";

export default function WomenPage() {
  const { t } = useLocale();

  return (
    <>
      <Navbar compact />
      <PageHeader title={t.womenPage.title} subtitle={t.womenPage.subtitle} />
      <main className={styles.grid}>
        {womenProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </main>
      <Footer />
    </>
  );
}
