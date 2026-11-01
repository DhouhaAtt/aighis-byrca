"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import styles from "./ProductInfo.module.css";
import { getLocalizedProductCopy } from "../../../lib/i18n/productCopy";
import type { ProductDetail } from "../../../lib/productData";
import { useWishlist } from "../../../context/WishlistContext";
import { useLocale } from "../../../context/LocaleContext";

import VariantSelector from "./VariantSelector";
import SizeSelector from "./SizeSelector";
import AddToCart from "./AddToCart";
import { useProductSelection } from "./ProductSelectionContext";
import { discountPercent } from "../../../lib/pricing";
import { localizeCategoryLabel } from "../../../lib/i18n/categoryLabel";

interface Props {
  product: ProductDetail;
}

export default function ProductInfo({ product }: Props) {
  const { selectedColor, setSelectedColor } = useProductSelection();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const { isLiked, toggleItem } = useWishlist();
  const { t } = useLocale();

  const liked = isLiked(product.id);
  const localizedName = getLocalizedProductCopy(product.id, product.name, t)?.name ?? product.name;
  const localizedCategory = localizeCategoryLabel(product.category, t.categories);
  const discount = discountPercent(product.price, product.originalPrice);
  const showSale = product.isOnSale && discount !== null;

  return (
    <section className={styles.info}>
      <p className={styles.collection}>{product.collection}</p>

      <h1 className={styles.title}>{localizedName}</h1>

      {showSale ? (
        <p className={styles.priceRow}>
          <span className={styles.originalPrice}>{product.originalPrice}</span>
          <span className={styles.price}>{product.price}</span>
          <span className={styles.discountBadge}>-{discount}%</span>
        </p>
      ) : (
        <p className={styles.price}>{product.price}</p>
      )}

      <p className={styles.category}>{localizedCategory}</p>

      {product.colors.length > 0 && selectedColor && (
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
            name: localizedName,
            price: product.price,
            category: product.category,
            image: selectedColor?.image || product.images[0],
          }}
          size={selectedSize}
          color={selectedColor?.name ?? null}
          hex={selectedColor?.hex ?? null}
        />

        <button
          onClick={() =>
            toggleItem({
              id: product.id,
              name: localizedName,
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

        {product.productCode?.trim() && (
          <p className={styles.code}>{t.productDetail.productCode}: {product.productCode.trim()}</p>
        )}
      </div>
    </section>
  );
}
