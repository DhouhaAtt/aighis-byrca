"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle } from "lucide-react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import { useCart } from "../context/CartContext";
import { useLocale } from "../context/LocaleContext";

import styles from "./CheckoutPage.module.css";

type PaymentMethod = "bankTransfer" | "onDelivery" | "d17";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { t } = useLocale();

  const [payment, setPayment] = useState<PaymentMethod>("onDelivery");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const updateField = useCallback(
    (field: keyof typeof form, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setProcessing(true);

      try {
        const paymentMap: Record<string, string> = {
          bankTransfer: "Bank Transfer",
          onDelivery: "Cash on Delivery",
          d17: "D17",
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: form.fullName,
            customerEmail: "",
            customerPhone: form.phone,
            address: form.address,
            city: form.city,
            postalCode: form.postalCode,
            paymentMethod: paymentMap[payment],
            totalAmount: `${totalPrice} Tnd`,
            items: items.map((item) => ({
              productId: item.id,
              productName: item.name,
              productPrice: item.price,
              size: item.size,
              quantity: item.quantity,
            })),
          }),
        });

        if (!res.ok) throw new Error("Failed to create order");
        setSuccess(true);
        clearCart();
      } catch {
        alert("Something went wrong. Please try again.");
      } finally {
        setProcessing(false);
      }
    },
    [form, payment, totalPrice, items, clearCart]
  );

  if (success) {
    return (
      <>
        <Navbar compact />
        <main className={styles.page}>
          <div className={styles.success}>
            <CheckCircle size={56} strokeWidth={1.2} className={styles.successIcon} />
            <h1 className={styles.successTitle}>{t.checkout.success}</h1>
            <p className={styles.successMessage}>{t.checkout.successMessage}</p>
            <Link href="/" className={styles.successBtn}>
              {t.checkout.backToShop}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar compact />
        <PageHeader title={t.checkout.title} subtitle={t.checkout.subtitle} />
        <main className={styles.page}>
          <div className={styles.empty}>
            <p className={styles.emptyText}>{t.checkout.emptyCart}</p>
            <Link href="/products" className={styles.emptyLink}>
              {t.cart.continueShopping}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar compact />
      <PageHeader title={t.checkout.title} subtitle={t.checkout.subtitle} />

      <main className={styles.page}>
        <form className={styles.layout} onSubmit={handleSubmit}>
          <div>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>{t.checkout.shippingAddress}</h2>
              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <label className={styles.label}>{t.checkout.fullName}</label>
                  <input
                    className={styles.input}
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t.checkout.address}</label>
                  <input
                    className={styles.input}
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    required
                  />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>{t.checkout.city}</label>
                    <input
                      className={styles.input}
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t.checkout.postalCode}</label>
                    <input
                      className={styles.input}
                      value={form.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t.checkout.phone}</label>
                  <input
                    className={styles.input}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>{t.checkout.paymentMethod}</h2>
              <div className={styles.paymentOptions}>
                <label
                  className={`${styles.paymentOption} ${payment === "onDelivery" ? styles.paymentOptionActive : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className={styles.radio}
                    checked={payment === "onDelivery"}
                    onChange={() => setPayment("onDelivery")}
                  />
                  <div>
                    <div className={styles.paymentLabel}>{t.checkout.onDelivery}</div>
                    <div className={styles.paymentDesc}>{t.checkout.onDeliveryDesc}</div>
                  </div>
                </label>

                <label
                  className={`${styles.paymentOption} ${payment === "bankTransfer" ? styles.paymentOptionActive : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className={styles.radio}
                    checked={payment === "bankTransfer"}
                    onChange={() => setPayment("bankTransfer")}
                  />
                  <div>
                    <div className={styles.paymentLabel}>{t.checkout.bankTransfer}</div>
                    <div className={styles.paymentDesc}>{t.checkout.bankTransferDesc}</div>
                  </div>
                </label>

                <label
                  className={`${styles.paymentOption} ${payment === "d17" ? styles.paymentOptionActive : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className={styles.radio}
                    checked={payment === "d17"}
                    onChange={() => setPayment("d17")}
                  />
                  <div>
                    <div className={styles.paymentLabel}>{t.checkout.d17}</div>
                    <div className={styles.paymentDesc}>{t.checkout.d17Desc}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>{t.checkout.orderSummary}</h2>

            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={56}
                    height={72}
                    className={styles.summaryItemImage}
                  />
                  <div className={styles.summaryItemInfo}>
                    <div className={styles.summaryItemName}>{item.name}</div>
                    <div className={styles.summaryItemDetail}>
                      {t.cart.size}: {item.size} &middot; {t.cart.item}: {item.quantity}
                    </div>
                  </div>
                  <div className={styles.summaryItemPrice}>{item.price}</div>
                </div>
              ))}
            </div>

            <div className={styles.summaryRow}>
              <span>{t.checkout.subtotal}</span>
              <span>{totalPrice} {t.checkout.currency}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>{t.checkout.shipping}</span>
              <span className={styles.free}>{t.checkout.complimentary}</span>
            </div>

            <div className={styles.divider} />

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>{t.checkout.total}</span>
              <span>{totalPrice} {t.checkout.currency}</span>
            </div>

            <button
              type="submit"
              className={styles.placeOrderBtn}
              disabled={processing}
            >
              {processing ? t.checkout.processing : t.checkout.placeOrder}
            </button>

            <Link href="/cart" className={styles.backLink}>
              <ArrowLeft size={14} strokeWidth={1.5} />
              {t.cart.continueShopping}
            </Link>
          </aside>
        </form>
      </main>

      <Footer />
    </>
  );
}
