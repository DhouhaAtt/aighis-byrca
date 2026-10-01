"use client";

import styles from "./AddToCart.module.css";
import { useCart } from "../../../context/CartContext";
import { useLocale } from "../../../context/LocaleContext";
import type { Product } from "../../../components/NewArrivals/products";

interface Props {
  product: Product;
  size?: string;
  color?: string | null;
  hex?: string | null;
}

export default function AddToCart({
  product,
  size = "One Size",
  color = null,
  hex = null,
}: Props) {
  const { addItem } = useCart();
  const { t } = useLocale();

  return (
    <button onClick={() => addItem(product, size, color, hex)} className={styles.button}>
      {t.productDetail.addToCart}
    </button>
  );
}
