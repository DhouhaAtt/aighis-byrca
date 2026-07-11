"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, Tags, DollarSign } from "lucide-react";
import styles from "./DashboardPage.module.css";

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  items: number;
  total: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats({
          totalProducts: data.totalProducts,
          totalCategories: data.totalCategories,
          totalOrders: data.totalOrders,
          revenue: data.revenue,
        });
        setOrders(data.recentOrders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { value: String(stats.totalProducts), label: "Products", icon: Package, dark: true },
        { value: String(stats.totalCategories), label: "Categories", icon: Tags, dark: false },
        { value: String(stats.totalOrders), label: "Orders", icon: ShoppingBag, dark: true },
        { value: `${stats.revenue.toFixed(2)} Tnd`, label: "Revenue", icon: DollarSign, dark: false },
      ]
    : [];

  return (
    <div>
      <div className={styles.grid}>
        {(loading ? [] : statCards).map(({ value, label, icon: Icon, dark }) => (
          <div key={label} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardValue}>{value}</div>
                <div className={styles.cardLabel}>{label}</div>
              </div>
              <div className={`${styles.cardIcon} ${dark ? styles.cardIconDark : styles.cardIconLight}`}>
                <Icon size={20} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center", color: "#888", fontSize: 13 }}>
            Loading...
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/admin/dashboard/orders" className={styles.sectionLink}>
            View All
          </Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td>{order.total}</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      order.status === "Delivered"
                        ? styles.statusDelivered
                        : order.status === "Shipped"
                          ? styles.statusShipped
                          : styles.statusPending
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
