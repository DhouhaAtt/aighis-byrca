"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Eye, Trash2, X, Mail, RefreshCw } from "lucide-react";
import styles from "../AdminTable.module.css";

interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  productPrice: string;
  size: string;
  color: string | null;
  hex: string | null;
  quantity: number;
}

interface StatusEvent {
  id: number;
  status: string;
  note: string | null;
  createdAt: string;
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
  events?: StatusEvent[];
}

const PER_PAGE = 10;

const WORKFLOW = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Shipped",
  "Delivered",
] as const;

const STATUS_LABELS: Record<string, string> = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Preparing: "Preparing",
  Ready: "Ready",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

function statusClass(status: string) {
  switch (status) {
    case "Delivered":
      return styles.statusDelivered;
    case "Shipped":
    case "Ready":
      return styles.statusShipped;
    case "Cancelled":
      return styles.statusCancelled;
    case "Preparing":
      return styles.statusPreparing;
    case "Confirmed":
      return styles.statusConfirmed;
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

function formatDateTime(dateStr: string) {
  try {
    return new Date(dateStr).toISOString().slice(0, 16).replace("T", " ");
  } catch {
    return dateStr;
  }
}

function lineTotal(price: string, quantity: number): string {
  const amount = Number(price.replace(/[^\d.]/g, ""));
  return Number.isFinite(amount) ? (amount * quantity).toFixed(2) : "—";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [snackbar, setSnackbar] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const showSnackbar = useCallback((type: "success" | "error", message: string) => {
    setSnackbar({ type, message });
    setTimeout(() => setSnackbar(null), 4000);
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed");
      setOrders(await res.json());
      setFetchError(null);
    } catch {
      setFetchError("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (statusFilter === "" || o.status === statusFilter) &&
          (o.orderRef.toLowerCase().includes(search.toLowerCase()) ||
            o.customerName.toLowerCase().includes(search.toLowerCase()) ||
            o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
            o.customerPhone.toLowerCase().includes(search.toLowerCase()) ||
            o.status.toLowerCase().includes(search.toLowerCase()))
      ),
    [orders, search, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  );

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deleteTarget) setDeleteTarget(null);
        else if (detailOrder) setDetailOrder(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [detailOrder, deleteTarget]);

  const updateStatus = useCallback(
    async (id: number, status: string, notify = true) => {
      setBusy(true);
      try {
        const res = await fetch(`/api/orders/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, notify }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          showSnackbar("error", data?.error ?? "Impossible de mettre à jour le statut");
          return;
        }

        const updated: Order = data.order;
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        setDetailOrder((prev) => (prev && prev.id === updated.id ? updated : prev));

        if (data.email?.sent) {
          showSnackbar("success", `Statut mis à jour: ${status} — email envoyé au client`);
        } else if (data.email && !data.email.sent) {
          showSnackbar(
            "success",
            `Statut mis à jour: ${status} — email non envoyé (${data.email.reason ?? "aucune clé API"})`
          );
        } else {
          showSnackbar("success", `Statut mis à jour: ${STATUS_LABELS[status] ?? status}`);
        }
      } catch {
        showSnackbar("error", "Impossible de mettre à jour le statut");
      } finally {
        setBusy(false);
      }
    },
    [showSnackbar]
  );

  const resendEmail = useCallback(
    async (order: Order) => {
      setBusy(true);
      try {
        const res = await fetch(`/api/orders/${order.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: order.status }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          showSnackbar("error", data?.error ?? "Email non envoyé");
          return;
        }
        showSnackbar("success", `Email renvoyé à ${order.customerEmail}`);
      } catch {
        showSnackbar("error", "Email non envoyé");
      } finally {
        setBusy(false);
      }
    },
    [showSnackbar]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showSnackbar("error", data?.error ?? "Impossible de supprimer la commande");
        setDeleteTarget(null);
        return;
      }
      setOrders((prev) => {
        const next = prev.filter((o) => o.id !== deleteTarget.id);
        const newTotalPages = Math.max(1, Math.ceil(next.length / PER_PAGE));
        if (page > newTotalPages) setPage(newTotalPages);
        return next;
      });
      if (detailOrder?.id === deleteTarget.id) setDetailOrder(null);
      showSnackbar(
        "success",
        data?.restocked
          ? "Commande supprimée et stock restitué"
          : "Commande supprimée"
      );
    } catch {
      showSnackbar("error", "Impossible de supprimer la commande");
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, showSnackbar, page, detailOrder]);

  const isTerminal = detailOrder?.status === "Delivered" || detailOrder?.status === "Cancelled";
  const canNotify =
    !isTerminal && (detailOrder?.status === "Ready" || detailOrder?.status === "Shipped");

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
          placeholder="Search by ref, name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className={styles.input}
            style={{ width: 180, height: 42 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {Object.keys(STATUS_LABELS).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button className={styles.actionBtn} onClick={loadOrders} title="Refresh" disabled={loading}>
            <RefreshCw size={16} strokeWidth={1.5} />
          </button>
        </div>
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
              <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</td>
            </tr>
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#888" }}>No orders found</td>
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
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.actionBtn} onClick={() => setDetailOrder(order)}>
                      <Eye size={15} strokeWidth={1.5} />
                    </button>
                    <button className={styles.actionBtn} onClick={() => setDeleteTarget(order)}>
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && filtered.length > PER_PAGE && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          <div className={styles.paginationBtns}>
            <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
            {renderPages()}
            <button className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        </div>
      )}

      {detailOrder && (
        <div className={styles.overlay} onClick={() => setDetailOrder(null)}>
          <div className={styles.modal} style={{ width: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{detailOrder.orderRef}</h3>
              <button className={styles.modalClose} onClick={() => setDetailOrder(null)}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <div><strong>Customer:</strong> {detailOrder.customerName}</div>
                <div><strong>Email:</strong> {detailOrder.customerEmail || "—"}</div>
                <div><strong>Phone:</strong> {detailOrder.customerPhone}</div>
                <div><strong>Address:</strong> {detailOrder.address}, {detailOrder.city} {detailOrder.postalCode}</div>
                <div><strong>Payment:</strong> {detailOrder.paymentMethod}</div>
                <div><strong>Total:</strong> {detailOrder.totalAmount}</div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className={`${styles.status} ${statusClass(detailOrder.status)}`}>
                    {STATUS_LABELS[detailOrder.status] ?? detailOrder.status}
                  </span>
                </div>
                {detailOrder.notes && <div><strong>Notes:</strong> {detailOrder.notes}</div>}
              </div>

              <div style={{ marginTop: 16, fontWeight: 500, fontSize: 13 }}>Items</div>
              <table className={styles.table} style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Color</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.size}</td>
                      <td>
                        {item.color ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: item.hex ?? "#ccc",
                                border: "1px solid rgba(0,0,0,0.15)",
                                display: "inline-block",
                              }}
                            />
                            {item.color}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{lineTotal(item.productPrice, item.quantity)} Tnd</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>Update status</div>
                {isTerminal ? (
                  <p style={{ fontSize: 12, color: "#999", margin: 0 }}>
                    This order is closed ({STATUS_LABELS[detailOrder.status]}). Its status can no
                    longer be changed, but the order can still be deleted.
                  </p>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {WORKFLOW.map((s) => {
                        const active = detailOrder.status === s;
                        const notifies = s === "Ready" || s === "Shipped";
                        return (
                          <button
                            key={s}
                            className={styles.saveBtn}
                            style={{
                              opacity: active ? 1 : 0.75,
                              fontSize: 10,
                              padding: "8px 14px",
                              height: "auto",
                              background: active ? "#111" : "#fff",
                              color: active ? "#fff" : "#333",
                              border: "1px solid #ddd",
                            }}
                            disabled={busy || active}
                            onClick={() => updateStatus(detailOrder.id, s)}
                          >
                            {STATUS_LABELS[s]}
                            {notifies ? " ✉" : ""}
                          </button>
                        );
                      })}
                      <button
                        className={styles.saveBtn}
                        style={{
                          fontSize: 10,
                          padding: "8px 14px",
                          height: "auto",
                          background: "#c62828",
                        }}
                        disabled={busy}
                        onClick={() => updateStatus(detailOrder.id, "Cancelled")}
                      >
                        Cancel order
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
                      ✉ marks a status that emails the customer. Cancelling returns the reserved stock.
                    </p>
                  </>
                )}
                {canNotify && (
                  <button
                    className={styles.cancelBtn}
                    style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6 }}
                    disabled={busy}
                    onClick={() => resendEmail(detailOrder)}
                  >
                    <Mail size={14} strokeWidth={1.5} />
                    Resend email to customer
                  </button>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>History</div>
                {(detailOrder.events ?? []).length === 0 ? (
                  <p style={{ fontSize: 12, color: "#999", margin: 0 }}>No status history yet.</p>
                ) : (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {(detailOrder.events ?? []).map((event) => (
                      <li key={event.id} style={{ display: "flex", gap: 10, fontSize: 12, alignItems: "baseline" }}>
                        <span className={`${styles.status} ${statusClass(event.status)}`}>
                          {STATUS_LABELS[event.status] ?? event.status}
                        </span>
                        <span style={{ color: "#888" }}>{formatDateTime(event.createdAt)}</span>
                        {event.note && <span style={{ color: "#555" }}>{event.note}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ width: 420 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Supprimer la commande</h3>
              <button className={styles.modalClose} onClick={() => setDeleteTarget(null)}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                Voulez-vous vraiment supprimer <strong>{deleteTarget.orderRef}</strong> de{" "}
                <strong>{deleteTarget.customerName}</strong> ?
              </p>
              <p style={{ fontSize: 12, color: "#888", margin: "10px 0 0" }}>
                Cette action est irréversible. Le stock réservé par cette commande sera
                restitué si la commande n&apos;est pas encore annulée.
              </p>
            </div>
            <div className={styles.modalFooter} style={{ gap: 12 }}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button
                className={styles.saveBtn}
                style={{ background: "#c62828" }}
                disabled={busy}
                onClick={confirmDelete}
              >
                Supprimer définitivement
              </button>
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
