"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { Edit3, Trash2, X } from "lucide-react";
import styles from "../AdminTable.module.css";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  gender: string | null;
  isOnSale: boolean;
  category: { id: number; name: string } | null;
}

interface Category {
  id: number;
  name: string;
}

const emptyForm = {
  name: "",
  price: "",
  image: "",
  gender: "",
  categoryId: "",
  isOnSale: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.category?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.gender ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: product.price,
      image: product.image,
      gender: product.gender ?? "",
      categoryId: product.category?.id ? String(product.category.id) : "",
      isOnSale: product.isOnSale,
    });
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = {
        name: form.name,
        price: form.price,
        image: form.image,
        gender: form.gender || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        isOnSale: form.isOnSale,
      };

      try {
        if (editing) {
          const res = await fetch(`/api/products/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) return;
          const updated = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        } else {
          const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) return;
          const created = await res.json();
          setProducts((prev) => [...prev, created]);
        }
        setShowModal(false);
      } catch {}
    },
    [form, editing]
  );

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  }, []);

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className={styles.addBtn} onClick={openAdd}>
          Add Product
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Category</th>
            <th>Gender</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                Loading...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                No products found
              </td>
            </tr>
          ) : (
            filtered.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productCell}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={44}
                      height={57}
                      className={styles.productThumb}
                    />
                    <span className={styles.productName}>{product.name}</span>
                  </div>
                </td>
                <td>{product.price}</td>
                <td>{product.category?.name ?? "-"}</td>
                <td>{product.gender ?? "-"}</td>
                <td>
                  {product.isOnSale ? (
                    <span className={`${styles.badge} ${styles.badgeSale}`}>Sale</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                  )}
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.actionBtn} onClick={() => openEdit(product)}>
                      <Edit3 size={15} strokeWidth={1.5} />
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleDelete(product.id)}>
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editing ? "Edit Product" : "Add Product"}</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Price</label>
                  <input className={styles.input} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Image URL</label>
                  <input className={styles.input} value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} required />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Gender</label>
                    <select className={styles.input} value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                      <option value="">-</option>
                      <option value="Women">Women</option>
                      <option value="Men">Men</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Category</label>
                    <select className={styles.input} value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                      <option value="">-</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.isOnSale}
                    onChange={(e) => setForm((f) => ({ ...f, isOnSale: e.target.checked }))}
                  />
                  On Sale
                </label>
              </div>
              <div className={styles.modalFooter}>
                <button type="submit" className={styles.saveBtn}>
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
