"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowLeft, Minus, Plus } from "lucide-react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import { useCart } from "../context/CartContext";
import { useLocale } from "../context/LocaleContext";

import styles from "./CartPage.module.css";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } =
    useCart();
  const { t } = useLocale();

  return (
    <>
      <Navbar compact />

      <PageHeader
        title={t.cart.title}
        subtitle={
          items.length === 0
            ? t.cart.empty
            : `${totalItems} ${totalItems === 1 ? t.cart.item : t.cart.items}`
        }
      />

      <main className={styles.page}>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={48} strokeWidth={1} className={styles.emptyIcon} />

            <p className={styles.emptyText}>{t.cart.emptySubtitle}</p>

            <Link href="/products" className={styles.continueLink}>
              {t.cart.continueShopping}
            </Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <Link
                    href={`/products/${item.id}`}
                    className={styles.itemImage}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={153}
                      className={styles.image}
                    />
                  </Link>

                  <div className={styles.itemInfo}>
                    <Link
                      href={`/products/${item.id}`}
                      className={styles.itemName}
                    >
                      {item.name}
                    </Link>

                    <p className={styles.itemSize}>{t.cart.size}: {item.size}</p>

                    <p className={styles.itemPrice}>{item.price}</p>

                    <div className={styles.quantity}>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className={styles.qtyBtn}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} strokeWidth={1.5} />
                      </button>

                      <span className={styles.qtyValue}>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className={styles.qtyBtn}
                      >
                        <Plus size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <p className={styles.itemTotal}>
                      {item.price}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className={styles.removeBtn}
                      aria-label={t.cart.removeItem}
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className={styles.summary}>
              <h2 className={styles.summaryTitle}>{t.cart.orderSummary}</h2>

              <div className={styles.summaryRow}>
                <span>{t.cart.subtotal}</span>
                <span>{totalPrice} {t.cart.currency}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>{t.cart.shipping}</span>
                <span className={styles.free}>{t.cart.complimentary}</span>
              </div>

              <div className={styles.divider} />

              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>{t.cart.total}</span>
                <span>{totalPrice} {t.cart.currency}</span>
              </div>

              <Link href="#" className={styles.checkoutBtn}>{t.cart.checkout}</Link>

              <Link href="/products" className={styles.continueShopping}>
                <ArrowLeft size={14} strokeWidth={1.5} />
                {t.cart.continueShopping}
              </Link>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
