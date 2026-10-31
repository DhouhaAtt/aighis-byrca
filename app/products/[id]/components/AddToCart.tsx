"use client";

import styles from "./AddToCart.module.css";
import { useCart } from "../../../context/CartContext";
import { useLocale } from "../../../context/LocaleContext";
import type { Product } from "../../../components/NewArrivals/products";
import { useState } from "react";

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
  const [notice, setNotice] = useState("");

  return (
    <>
      <button onClick={() => { addItem(product, size, color, hex); setNotice(t.cart.addedSuccessfully); window.setTimeout(() => setNotice(""), 2500); }} className={styles.button}>
        {t.productDetail.addToCart}
      </button>
      {notice && <span role="status" aria-live="polite">{notice}</span>}
    </>
  );
}
