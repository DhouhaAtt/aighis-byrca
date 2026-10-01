"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import PageHeader from "../components/PageHeader/PageHeader";
import { useLocale } from "../context/LocaleContext";

import styles from "./OrderTrackingPage.module.css";

interface TrackedItem {
  productName: string;
  size: string;
  color: string | null;
  hex: string | null;
  quantity: number;
  productPrice: string;
}

interface TrackedEvent {
  status: string;
  note: string | null;
  createdAt: string;
}

interface TrackedOrder {
  orderRef: string;
  status: string;
  customerName: string;
  totalAmount: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items: TrackedItem[];
  events: TrackedEvent[];
}

const STATUS_STYLE: Record<string, { icon: LucideIcon; color: string; key: string }> = {
  Pending: { icon: Clock, color: "#8B7355", key: "processing" },
  Confirmed: { icon: Package, color: "#111", key: "confirmed" },
  Preparing: { icon: Clock, color: "#8B7355", key: "preparing" },
  Ready: { icon: Package, color: "#4A7C59", key: "confirmed" },
  Shipped: { icon: Truck, color: "#111", key: "onTheWay" },
  Delivered: { icon: CheckCircle, color: "#4A7C59", key: "delivered" },
  Cancelled: { icon: AlertCircle, color: "#8B4513", key: "notPaid" },
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderTrackingPage() {
  const { t } = useLocale();
  const [ref, setRef] = useState("");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!ref.trim() || !contact.trim()) {
        setError(t.orderTracking.errorRequired);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/orders/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderRef: ref.trim(), contact: contact.trim() }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(data?.error ?? t.orderTracking.errorNotFound);
          setOrder(null);
          return;
        }

        setOrder(data as TrackedOrder);
      } catch {
        setError(t.orderTracking.errorGeneric);
      } finally {
        setLoading(false);
      }
    },
    [ref, contact, t]
  );

  const handleReset = () => {
    setRef("");
    setContact("");
    setOrder(null);
    setError(null);
  };

  const style = order ? STATUS_STYLE[order.status] ?? STATUS_STYLE.Pending : null;
  const StatusIcon = style?.icon ?? Package;
  const statusKey = style?.key ?? "processing";
  const statusColor = style?.color ?? "#111";
  const statusName = order
    ? (t.orderTracking.statusNames as Record<string, string>)[order.status] ??
      order.status
    : "";

  return (
    <div className={styles.page}>
      <Navbar compact />

      <PageHeader
        title={t.orderTracking.title}
        subtitle={t.orderTracking.subtitle}
      />

      <section className={styles.content}>
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
                    if (error) setError(null);
                  }}
                  className={`${styles.input} ${error ? styles.inputError : ""}`}
                  autoComplete="off"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="orderContact">
                  {t.orderTracking.contactLabel}
                </label>
                <input
                  id="orderContact"
                  type="text"
                  placeholder={t.orderTracking.contactPlaceholder}
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`${styles.input} ${error ? styles.inputError : ""}`}
                  autoComplete="off"
                />
              </div>

              {error && (
                <span className={styles.errorText} role="alert">
                  {error}
                </span>
              )}

              <button type="submit" className={styles.submit} disabled={loading}>
                <Package size={14} strokeWidth={1.5} />
                {loading ? t.orderTracking.searching : t.orderTracking.trackButton}
              </button>
            </form>
          </div>

          <p className={styles.hint}>{t.orderTracking.contactHint}</p>
        </div>

        {order && (
          <div className={styles.result}>
            <div className={styles.resultHeader}>
              <div className={styles.refBadge}>
                <span className={styles.refLabel}>
                  {t.orderTracking.orderRefLabel}
                </span>
                <span className={styles.refValue}>{order.orderRef}</span>
              </div>
            </div>

            <div className={styles.statusCard}>
              <div className={styles.statusIcon} style={{ color: statusColor }}>
                <StatusIcon size={32} strokeWidth={1.2} />
              </div>

              <h2 className={styles.statusTitle} style={{ color: statusColor }}>
                {statusName}
              </h2>

              <div className={styles.statusDivider} />

              <p className={styles.statusText}>
                {t.orderTracking.statuses[
                  statusKey as keyof typeof t.orderTracking.statuses
                ]}
              </p>

              <div className={styles.metaGrid}>
                <div>
                  <span className={styles.metaLabel}>
                    {t.orderTracking.placedOn}
                  </span>
                  <span className={styles.metaValue}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div>
                  <span className={styles.metaLabel}>
                    {t.orderTracking.lastUpdated}
                  </span>
                  <span className={styles.metaValue}>
                    {formatDateTime(order.updatedAt)}
                  </span>
                </div>
                <div>
                  <span className={styles.metaLabel}>
                    {t.orderTracking.paymentLabel}
                  </span>
                  <span className={styles.metaValue}>{order.paymentMethod}</span>
                </div>
                <div>
                  <span className={styles.metaLabel}>
                    {t.orderTracking.totalLabel}
                  </span>
                  <span className={styles.metaValue}>{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {order.items.length > 0 && (
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>{t.orderTracking.itemsTitle}</h3>
                <ul className={styles.itemList}>
                  {order.items.map((item, index) => (
                    <li key={`${item.productName}-${item.size}-${index}`} className={styles.itemRow}>
                      <span className={styles.itemName}>{item.productName}</span>
                      <span className={styles.itemMeta}>
                        {item.size}
                        {item.color ? ` · ${item.color}` : ""} ·{" "}
                        {t.orderTracking.quantityLabel} {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {order.events.length > 0 && (
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>{t.orderTracking.timelineTitle}</h3>
                <ol className={styles.timeline}>
                  {order.events.map((event, index) => (
                    <li key={`${event.status}-${index}`} className={styles.timelineItem}>
                      <span className={styles.timelineDot} />
                      <div>
                        <span className={styles.timelineStatus}>
                          {(t.orderTracking.statusNames as Record<string, string>)[
                            event.status
                          ] ?? event.status}
                        </span>
                        <span className={styles.timelineDate}>
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className={styles.actions}>
              <button onClick={handleReset} className={styles.trackAnother}>
                {t.orderTracking.trackAnother}
              </button>

              <Link href="/" className={styles.backLink}>
                <ArrowLeft size={14} strokeWidth={1.5} />
                {t.orderTracking.backToShop}
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
