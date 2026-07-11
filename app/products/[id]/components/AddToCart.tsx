"use client";

import styles from "./AddToCart.module.css";
import { useCart } from "../../../context/CartContext";
import { useLocale } from "../../../context/LocaleContext";
import type { Product } from "../../../components/NewArrivals/products";

interface Props {
  product: Product;
  size?: string;
}

export default function AddToCart({ product, size = "One Size" }: Props) {
  const { addItem } = useCart();
  const { t } = useLocale();

  return (
    <button onClick={() => addItem(product, size)} className={styles.button}>
      {t.productDetail.addToCart}
    </button>
  );
}
