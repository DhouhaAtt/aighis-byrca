"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Eye, X } from "lucide-react";
import styles from "../AdminTable.module.css";

interface OrderItem {
  id: number;
  productName: string;
  productPrice: string;
  size: string;
  quantity: number;
}

interface Order {
  id: number;
  orderRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

function statusClass(status: string) {
  switch (status) {
    case "Delivered":
      return styles.statusDelivered;
    case "Shipped":
      return styles.statusShipped;
    default:
      return styles.statusPending;
  }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.orderRef.toLowerCase().includes(search.toLowerCase()) ||
          o.customerName.toLowerCase().includes(search.toLowerCase()) ||
          o.status.toLowerCase().includes(search.toLowerCase())
      ),
    [orders, search]
  );

  const updateStatus = useCallback(async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setDetailOrder((prev) => (prev?.id === updated.id ? updated : prev));
    } catch {}
  }, []);

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                Loading...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                No orders found
              </td>
            </tr>
          ) : (
            filtered.map((order) => (
              <tr key={order.id}>
                <td style={{ fontWeight: 400 }}>{order.orderRef}</td>
                <td style={{ color: "#888", fontSize: 12 }}>{formatDate(order.createdAt)}</td>
                <td>
                  <div style={{ fontSize: 13 }}>{order.customerName}</div>
                  <div style={{ fontSize: 11, color: "#999" }}>{order.customerEmail}</div>
                </td>
                <td>{order.items.length}</td>
                <td>{order.totalAmount}</td>
                <td style={{ fontSize: 12, color: "#666" }}>{order.paymentMethod}</td>
                <td>
                  <span className={`${styles.status} ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button className={styles.actionBtn} onClick={() => setDetailOrder(order)}>
                    <Eye size={15} strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {detailOrder && (
        <div className={styles.overlay} onClick={() => setDetailOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{detailOrder.orderRef}</h3>
              <button className={styles.modalClose} onClick={() => setDetailOrder(null)}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <div><strong>Customer:</strong> {detailOrder.customerName}</div>
                <div><strong>Email:</strong> {detailOrder.customerEmail}</div>
                <div><strong>Phone:</strong> {detailOrder.customerPhone}</div>
                <div><strong>Address:</strong> {detailOrder.address}, {detailOrder.city} {detailOrder.postalCode}</div>
                <div><strong>Payment:</strong> {detailOrder.paymentMethod}</div>
                <div><strong>Total:</strong> {detailOrder.totalAmount}</div>
                <div><strong>Status:</strong> {detailOrder.status}</div>
              </div>

              <div style={{ marginTop: 16, fontWeight: 500, fontSize: 13 }}>Items</div>
              <table className={styles.table} style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items.map((item) => {
                    const itemTotal = (Number(item.productPrice.replace(/[^0-9.]/g, "")) * item.quantity).toFixed(2);
                    return (
                      <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td>{item.productPrice}</td>
                        <td>{item.size}</td>
                        <td>{item.quantity}</td>
                        <td>{itemTotal} Tnd</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Update Status:</span>
                {["Pending", "Shipped", "Delivered"].map((s) => (
                  <button
                    key={s}
                    className={styles.saveBtn}
                    style={{
                      opacity: detailOrder.status === s ? 1 : 0.5,
                      fontSize: 10,
                      padding: "6px 14px",
                      height: "auto",
                    }}
                    onClick={() => updateStatus(detailOrder.id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
