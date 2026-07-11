"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Edit3, Trash2, X } from "lucide-react";
import styles from "../AdminTable.module.css";

interface Category {
  id: number;
  name: string;
  slug: string;
  _count: { products: number };
}

const emptyForm = { name: "", slug: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase())
      ),
    [categories, search]
  );

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug });
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (editing) {
          const res = await fetch(`/api/categories/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          if (!res.ok) return;
          const updated = await res.json();
          setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        } else {
          const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          if (!res.ok) return;
          const created = await res.json();
          setCategories((prev) => [...prev, created]);
        }
        setShowModal(false);
      } catch {}
    },
    [form, editing]
  );

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  }, []);

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className={styles.addBtn} onClick={openAdd}>
          Add Category
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Products</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                Loading...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                No categories found
              </td>
            </tr>
          ) : (
            filtered.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <span className={styles.productName}>{cat.name}</span>
                </td>
                <td style={{ color: "#888", fontSize: 12 }}>{cat.slug}</td>
                <td>{cat._count.products}</td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.actionBtn} onClick={() => openEdit(cat)}>
                      <Edit3 size={15} strokeWidth={1.5} />
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleDelete(cat.id)}>
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
              <h3 className={styles.modalTitle}>{editing ? "Edit Category" : "Add Category"}</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name,
                        slug: editing ? f.slug : name.toLowerCase().replace(/\s+/g, "-"),
                      }));
                    }}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Slug</label>
                  <input
                    className={styles.input}
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    required
                  />
                </div>
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
