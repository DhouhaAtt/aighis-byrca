"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Eye, Trash2, X } from "lucide-react";
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
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

const PER_PAGE = 10;

function statusClass(status: string) {
  switch (status) {
    case "Delivered":
      return styles.statusDelivered;
    case "Shipped":
      return styles.statusShipped;
    case "Cancelled":
      return styles.statusCancelled;
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
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [snackbar, setSnackbar] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const showSnackbar = useCallback((type: "success" | "error", message: string) => {
    setSnackbar({ type, message });
    setTimeout(() => setSnackbar(null), 3000);
  }, []);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((data) => setOrders(data))
      .catch(() => setFetchError("Impossible de charger les commandes"))
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  );

  useEffect(() => { setPage(1); }, [search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (cancelTarget) setCancelTarget(null);
        else if (detailOrder) setDetailOrder(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [detailOrder, cancelTarget]);

  const updateStatus = useCallback(async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        showSnackbar("error", "Y a un problème, impossible de mettre à jour");
        return;
      }
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)));
      if (detailOrder?.id === updated.id) {
        setDetailOrder((prev) => prev ? { ...prev, status: updated.status } : null);
      }
      showSnackbar("success", `Statut mis à jour: ${status}`);
    } catch {
      showSnackbar("error", "Y a un problème, impossible de mettre à jour");
    }
  }, [showSnackbar, detailOrder]);

  const confirmCancel = useCallback(async () => {
    if (!cancelTarget) return;
    try {
      const res = await fetch(`/api/orders/${cancelTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (!res.ok) {
        showSnackbar("error", "Y a un problème, impossible d'annuler");
        setCancelTarget(null);
        return;
      }
      setOrders((prev) => {
        const next = prev.map((o) => (o.id === cancelTarget.id ? { ...o, status: "Cancelled" } : o));
        const newTotalPages = Math.max(1, Math.ceil(next.length / PER_PAGE));
        if (page > newTotalPages) setPage(newTotalPages);
        return next;
      });
      showSnackbar("success", "Commande annulée avec succès");
    } catch {
      showSnackbar("error", "Y a un problème, impossible d'annuler");
    }
    setCancelTarget(null);
  }, [cancelTarget, showSnackbar, page]);

  function renderPages() {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
      .reduce<(number | "...")[]>((acc, p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
        acc.push(p);
        return acc;
      }, [])
      .map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className={styles.paginationPage} style={{ border: "none", cursor: "default" }}>…</span>
        ) : (
          <button
            key={p}
            className={`${styles.paginationPage} ${p === page ? styles.paginationPageActive : ""}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        )
      );
  }

  return (
    <div>
      <div className={styles.countText}>
        {loading ? "Loading..." : fetchError ? (
          <div style={{ padding: 40, textAlign: "center", color: "#c62828", fontSize: 13 }}>{fetchError}</div>
        ) : `${filtered.length} order${filtered.length !== 1 ? "s" : ""} total`}
      </div>

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
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                No orders found
              </td>
            </tr>
          ) : (
            paginated.map((order) => (
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
                  <div className={styles.actionBtns}>
                    <button className={styles.actionBtn} onClick={() => setDetailOrder(order)}>
                      <Eye size={15} strokeWidth={1.5} />
                    </button>
                    {order.status !== "Cancelled" && (
                      <button className={styles.actionBtn} onClick={() => setCancelTarget(order)}>
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && filtered.length > PER_PAGE && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          <div className={styles.paginationBtns}>
            <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
            {renderPages()}
            <button className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        </div>
      )}

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
                {detailOrder.notes && (
                  <div><strong>Notes:</strong> {detailOrder.notes}</div>
                )}
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

              {detailOrder.status !== "Cancelled" && (
                <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
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
              )}
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className={styles.overlay} onClick={() => setCancelTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ width: 400 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirmer l'annulation</h3>
              <button className={styles.modalClose} onClick={() => setCancelTarget(null)}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                Voulez-vous vraiment annuler la commande <strong>{cancelTarget.orderRef}</strong> de <strong>{cancelTarget.customerName}</strong> ?
              </p>
            </div>
            <div className={styles.modalFooter} style={{ gap: 12 }}>
              <button className={styles.cancelBtn} onClick={() => setCancelTarget(null)}>Non, garder</button>
              <button className={styles.saveBtn} style={{ background: "#c62828" }} onClick={confirmCancel}>Oui, annuler</button>
            </div>
          </div>
        </div>
      )}

      {snackbar && (
        <div className={`${styles.snackbar} ${snackbar.type === "success" ? styles.snackbarSuccess : styles.snackbarError}`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
}
