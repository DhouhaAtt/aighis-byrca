"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import styles from "./ProductInfo.module.css";
import type { ProductDetail } from "../../../lib/productData";
import { useWishlist } from "../../../context/WishlistContext";
import { useLocale } from "../../../context/LocaleContext";

import VariantSelector from "./VariantSelector";
import SizeSelector from "./SizeSelector";
import AddToCart from "./AddToCart";
import { discountPercent } from "../../../lib/pricing";

interface Props {
  product: ProductDetail;
}

export default function ProductInfo({ product }: Props) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const { isLiked, toggleItem } = useWishlist();
  const { t } = useLocale();

  const liked = isLiked(product.id);
  const discount = discountPercent(product.price, product.originalPrice);
  const showSale = product.isOnSale && discount !== null;

  return (
    <section className={styles.info}>
      <p className={styles.collection}>{product.collection}</p>

      <h1 className={styles.title}>{product.name}</h1>

      {showSale ? (
        <p className={styles.priceRow}>
          <span className={styles.originalPrice}>{product.originalPrice}</span>
          <span className={styles.price}>{product.price}</span>
          <span className={styles.discountBadge}>-{discount}%</span>
        </p>
      ) : (
        <p className={styles.price}>{product.price}</p>
      )}

      <p className={styles.category}>{product.category}</p>

      {product.colors.length > 0 && (
        <VariantSelector
          variants={product.colors}
          selected={selectedColor}
          onChange={setSelectedColor}
          label={t.productDetail.color}
        />
      )}

      {product.sizes.length > 0 && (
        <SizeSelector
          sizes={product.sizes}
          selected={selectedSize}
          onChange={setSelectedSize}
        />
      )}

      <div className={styles.actions}>
        <AddToCart
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.images[0],
          }}
          size={selectedSize}
          color={selectedColor?.name ?? null}
          hex={selectedColor?.hex ?? null}
        />

        <button
          onClick={() =>
            toggleItem({
              id: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
              image: product.images[0],
            })
          }
          className={styles.wishlistBtn}
          aria-label={
            liked
              ? t.productDetail.removeFromWishlist
              : t.productDetail.addToWishlist
          }
        >
          <Heart
            size={20}
            strokeWidth={1.5}
            fill={liked ? "#111" : "transparent"}
          />
        </button>
      </div>

      <div className={styles.meta}>
        <p className={styles.shipping}>{product.shipping}</p>

        <p className={styles.code}>{t.productDetail.productCode}: {product.productCode}</p>
      </div>
    </section>
  );
}
