"use client";

import { useState } from "react";
import { Package, Truck, CheckCircle, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import { useLocale } from "../context/LocaleContext";

import styles from "./OrderTrackingPage.module.css";

type StatusKey = "preparing" | "onTheWay" | "delivered" | "notPaid" | "confirmed" | "processing";

interface StatusConfig {
  icon: LucideIcon;
  color: string;
}

const STATUS_KEYS: StatusKey[] = [
  "preparing",
  "onTheWay",
  "delivered",
  "notPaid",
  "confirmed",
  "processing",
];

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  preparing: { icon: Clock, color: "#8B7355" },
  onTheWay: { icon: Truck, color: "#111" },
  delivered: { icon: CheckCircle, color: "#4A7C59" },
  notPaid: { icon: AlertCircle, color: "#8B4513" },
  confirmed: { icon: Package, color: "#111" },
  processing: { icon: Package, color: "#8B7355" },
};

export default function OrderTrackingPage() {
  const { t } = useLocale();
  const [ref, setRef] = useState("");
  const [tracked, setTracked] = useState(false);
  const [statusKey, setStatusKey] = useState<StatusKey>("preparing");
  const [error, setError] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = ref.trim();
    if (!trimmed) {
      setError(true);
      return;
    }

    setError(false);
    setStatusKey(STATUS_KEYS[Math.floor(Math.random() * STATUS_KEYS.length)]);
    setTracked(true);
  };

  const handleReset = () => {
    setRef("");
    setTracked(false);
    setError(false);
  };

  const { icon: StatusIcon, color: statusColor } = STATUS_CONFIG[statusKey];

  return (
    <div className={styles.page}>
      <Navbar compact />

      <PageHeader
        title={t.orderTracking.title}
        subtitle={t.orderTracking.subtitle}
      />

      <section className={styles.content}>
        {tracked ? (
          <div className={styles.result}>
            <div className={styles.resultHeader}>
              <div className={styles.refBadge}>
                <span className={styles.refLabel}>{t.orderTracking.orderRefLabel}</span>
                <span className={styles.refValue}>{ref}</span>
              </div>
            </div>

            <div className={styles.statusCard}>
              <div className={styles.statusIcon} style={{ color: statusColor }}>
                <StatusIcon size={32} strokeWidth={1.2} />
              </div>

              <h2 className={styles.statusTitle} style={{ color: statusColor }}>
                {t.orderTracking.statusTitle}
              </h2>

              <div className={styles.statusDivider} />

              <p className={styles.statusText}>
                {t.orderTracking.statuses[statusKey]}
              </p>

              <p className={styles.thankYou}>{t.orderTracking.thankYou}</p>
            </div>

            <div className={styles.actions}>
              <button onClick={handleReset} className={styles.trackAnother}>
                Track Another Order
              </button>

              <a href="/" className={styles.backLink}>
                <ArrowLeft size={14} strokeWidth={1.5} />
                {t.orderTracking.backToShop}
              </a>
            </div>
          </div>
        ) : (
          <div className={styles.formWrapper}>
            <div className={styles.formCard}>
              <form onSubmit={handleTrack} className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="orderRef">
                    {t.orderTracking.orderRefLabel}
                  </label>
                  <input
                    id="orderRef"
                    type="text"
                    placeholder={t.orderTracking.placeholder}
                    value={ref}
                    onChange={(e) => {
                      setRef(e.target.value);
                      if (error) setError(false);
                    }}
                    className={`${styles.input} ${error ? styles.inputError : ""}`}
                    autoComplete="off"
                  />
                  {error && (
                    <span className={styles.errorText}>
                      Please enter your order reference.
                    </span>
                  )}
                </div>

                <button type="submit" className={styles.submit}>
                  <Package size={14} strokeWidth={1.5} />
                  {t.orderTracking.trackButton}
                </button>
              </form>
            </div>

            <p className={styles.hint}>
              Your order reference can be found in your confirmation email.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
