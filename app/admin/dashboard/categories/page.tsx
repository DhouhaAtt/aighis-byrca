"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Edit3, Trash2, X } from "lucide-react";
import styles from "../AdminTable.module.css";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  order: number;
  _count: { products: number };
}

const emptyForm = { name: "", slug: "", description: "", image: "", isActive: true, order: 0 };
const PER_PAGE = 10;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [deleteTargets, setDeleteTargets] = useState<Category[] | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const showSnackbar = useCallback((type: "success" | "error", message: string) => {
    setSnackbar({ type, message });
    setTimeout(() => setSnackbar(null), 3000);
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((data) => setCategories(data))
      .catch(() => setFetchError("Impossible de charger les catégories"))
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deleteTargets) setDeleteTargets(null);
        else if (showModal) setShowModal(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showModal, deleteTargets]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      isActive: cat.isActive,
      order: cat.order,
    });
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const payload = {
          ...form,
          description: form.description || null,
          image: form.image || null,
        };
        if (editing) {
          const res = await fetch(`/api/categories/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            showSnackbar("error", "Impossible de mettre à jour la catégorie");
            return;
          }
          const updated = await res.json();
          setCategories((prev) => prev.map((category) => category.id === updated.id ? updated : category));
          showSnackbar("success", "Catégorie mise à jour avec succès");
        } else {
          const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            showSnackbar("error", "Impossible de créer la catégorie");
            return;
          }
          const created = await res.json();
          setCategories((prev) => [...prev, created]);
          showSnackbar("success", "Catégorie ajoutée avec succès");
        }
        setShowModal(false);
      } catch {
        showSnackbar("error", "Impossible d'enregistrer la catégorie");
      }
    },
    [form, editing, showSnackbar]
  );
  const confirmDelete = useCallback(async () => {
    if (!deleteTargets?.length) return;
    try {
      const res = await fetch("/api/categories/bulk-delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: deleteTargets.map((category) => category.id) }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "La suppression a échoué");
      setCategories((prev) => {
        const deletedIds = new Set(deleteTargets.map((category) => category.id));
        const next = prev.filter((c) => !deletedIds.has(c.id));
        const newTotalPages = Math.max(1, Math.ceil(next.length / PER_PAGE));
        if (page > newTotalPages) setPage(newTotalPages);
        return next;
      });
      const deletedIds = new Set(deleteTargets.map((category) => category.id));
      setSelectedCategoryIds((current) => current.filter((id) => !deletedIds.has(id)));
      showSnackbar("success", `${data?.deletedCount ?? deleteTargets.length} catégorie(s) supprimée(s) avec succès`);
    } catch (error) {
      showSnackbar("error", error instanceof Error ? error.message : "La suppression a échoué");
    }
    setDeleteTargets(null);
  }, [deleteTargets, showSnackbar, page]);

  return (
    <div>
      <div className={styles.countText}>
        {loading ? "Chargement…" : fetchError ? (
        <div style={{ padding: 40, textAlign: "center", color: "#c62828", fontSize: 13 }}>{fetchError}</div>
      ) : `${filtered.length} catégorie${filtered.length !== 1 ? "s" : ""} au total`}
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Rechercher une catégorie…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className={styles.addBtn} onClick={openAdd}>
          Ajouter une catégorie
        </button>
      </div>
      {selectedCategoryIds.length > 0 && (
        <div className={styles.selectionToolbar}>
          <span>{selectedCategoryIds.length} catégorie(s) sélectionnée(s)</span>
          <button className={styles.bulkDeleteButton} onClick={() => setDeleteTargets(categories.filter((category) => selectedCategoryIds.includes(category.id)))}>Supprimer la sélection</button>
          <button className={styles.selectionClear} onClick={() => setSelectedCategoryIds([])}>Effacer la sélection</button>
        </div>
      )}

      <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th aria-label="Sélectionner" />
            <th>Nom</th>
            <th>Identifiant</th>
            <th>Description</th>
            <th>Order</th>
            <th>Statut</th>
            <th>Produits</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                Chargement…
              </td>
            </tr>
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#888" }}>
                Aucune catégorie trouvée
              </td>
            </tr>
          ) : (
            paginated.map((cat) => (
              <tr key={cat.id}>
                <td><input aria-label={`Sélectionner ${cat.name}`} type="checkbox" checked={selectedCategoryIds.includes(cat.id)} onChange={(event) => setSelectedCategoryIds((current) => event.target.checked ? [...current, cat.id] : current.filter((id) => id !== cat.id))} /></td>
                <td>
                  <span className={styles.productName}>{cat.name}</span>
                </td>
                <td style={{ color: "#888", fontSize: 12 }}>{cat.slug}</td>
                <td style={{ color: "#888", fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {cat.description || "—"}
                </td>
                <td>{cat.order}</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      cat.isActive ? styles.statusDelivered : styles.statusPending
                    }`}
                  >
                    {cat.isActive ? "Activée" : "Désactivée"}
                  </span>
                </td>
                <td>{cat._count.products}</td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.actionBtn} onClick={() => openEdit(cat)}>
                      <Edit3 size={15} strokeWidth={1.5} />
                    </button>
                    <button className={styles.actionBtn} onClick={() => setDeleteTargets([cat])}>
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {!loading && filtered.length > PER_PAGE && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          <div className={styles.paginationBtns}>
            <button
              className={styles.paginationBtn}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
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
              )}
            <button
              className={styles.paginationBtn}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editing ? "Modifier la catégorie" : "Ajouter une catégorie"}</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.field}>
                  <label className={styles.label}>Nom</label>
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
                  <label className={styles.label}>Identifiant URL</label>
                  <input
                    className={styles.input}
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <input
                    className={styles.input}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>URL de l’image</label>
                  <input
                    className={styles.input}
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="/assets/categories/..."
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Ordre d’affichage</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Statut</label>
                  <select
                    className={styles.input}
                    value={form.isActive ? "true" : "false"}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === "true" }))}
                  >
                    <option value="true">Activée</option>
                    <option value="false">Désactivée</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter} style={{ gap: 12 }}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editing ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTargets && (
        <div className={styles.overlay} onClick={() => setDeleteTargets(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ width: 400 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirmer la suppression</h3>
              <button className={styles.modalClose} onClick={() => setDeleteTargets(null)}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                Voulez-vous vraiment supprimer {deleteTargets.length === 1 ? <strong>{deleteTargets[0].name}</strong> : <strong>{deleteTargets.length} catégories</strong>} ? Cette action est irréversible. Les produits associés resteront dans la boutique, mais ne seront plus rattachés à ces catégories. ({deleteTargets.reduce((total, category) => total + category._count.products, 0)} produit(s) concerné(s).)
              </p>
              {deleteTargets.length > 1 && <ul className={styles.deleteList}>{deleteTargets.map((category) => <li key={category.id}>{category.name} · {category._count.products} produit(s)</li>)}</ul>}
            </div>
            <div className={styles.modalFooter} style={{ gap: 12 }}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTargets(null)}>
                Annuler
              </button>
              <button className={styles.saveBtn} style={{ background: "#c62828" }} onClick={confirmDelete}>
                Supprimer {deleteTargets.length > 1 ? `(${deleteTargets.length})` : ""}
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
