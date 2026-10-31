"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

import styles from "./ProductCard.module.css";
import type { Product } from "../NewArrivals/products";
import { useWishlist } from "../../context/WishlistContext";
import { useLocale } from "../../context/LocaleContext";
import { discountPercent } from "../../lib/pricing";
import { localizeCategoryLabel } from "../../lib/i18n/categoryLabel";
import { getLocalizedProductCopy } from "../../lib/i18n/productCopy";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { isLiked, toggleItem } = useWishlist();
  const { t } = useLocale();
  const localizedName = getLocalizedProductCopy(product.id, product.name, t)?.name ?? product.name;
  const localizedCategory = localizeCategoryLabel(product.category, t.categories);
  const liked = isLiked(product.id);
  const discount = discountPercent(product.price, product.originalPrice);
  const showSale = product.isOnSale && discount !== null;

  return (
    <article className={styles.card}>
      {/* IMAGE AREA */}

      <div className={styles.imageArea}>
        <Link href={`/products/${product.id}`} className={styles.imageWrapper}>
          {/* Vertical Category */}

          <span className={styles.category}>{localizedCategory}</span>

          {/* Product Image */}

          <div className={styles.imageContainer}>
            <Image
              src={product.image}
              alt={localizedName}
              width={800}
              height={800}
              className={styles.image}
            />
          </div>
        </Link>

        {/* Wishlist */}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleItem(product);
          }}
          className={styles.wishlist}
          aria-label={
            liked
              ? t.productDetail.removeFromWishlist
              : t.productDetail.addToWishlist
          }
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={liked ? "black" : "transparent"}
          />
        </button>
      </div>

      {/* INFO */}

      <Link href={`/products/${product.id}`} className={styles.info}>
        <h3>{localizedName}</h3>

        <p className={styles.priceRow}>
          {showSale ? (
            <>
              <span className={styles.originalPrice}>{product.originalPrice}</span>
              <span className={styles.salePrice}>{product.price}</span>
              <span className={styles.discountBadge}>-{discount}%</span>
            </>
          ) : (
            product.price
          )}
        </p>
      </Link>
    </article>
  );
}
