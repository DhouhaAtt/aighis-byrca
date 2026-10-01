"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import ProductCard from "../components/ProductCard/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { useLocale } from "../context/LocaleContext";

import styles from "./WishlistPage.module.css";

export default function WishlistPage() {
  const { items, loading } = useWishlist();
  const { t } = useLocale();

  return (
    <>
      <Navbar compact />

      <PageHeader
        title={t.wishlist.title}
        subtitle={
          items.length === 0
            ? t.wishlist.empty
            : `${items.length} ${items.length === 1 ? t.wishlist.item : t.wishlist.items}`
        }
      />

      <section className={styles.content}>
        {loading ? (
          <div className={styles.grid}>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className={styles.skeleton} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <Heart size={48} strokeWidth={1} className={styles.emptyIcon} />

            <p className={styles.emptyText}>{t.wishlist.emptySubtitle}</p>

            <Link href="/products" className={styles.browseLink}>
              {t.wishlist.browseProducts}
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
