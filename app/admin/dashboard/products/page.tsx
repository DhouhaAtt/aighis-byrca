"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Edit3, Trash2, X, Upload } from "lucide-react";
import styles from "../AdminTable.module.css";

interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice: string | null;
  image: string;
  hoverImage: string | null;
  gender: string | null;
  isOnSale: boolean;
  stock: number;
  tags: string | null;
  collection: string | null;
  description: string | null;
  composition: string | null;
  fit: string | null;
  productCode: string | null;
  careInstructions: string | null;
  images: string | null;
  colors: string | null;
  sizes: string | null;
  shipping: string | null;
  returns: string | null;
  category: { id: number; name: string } | null;
}

interface Category {
  id: number;
  name: string;
}

const emptyForm = {
  name: "",
  price: "",
  originalPrice: "",
  image: "",
  hoverImage: "",
  gender: "",
  isOnSale: false,
  stock: 0,
  tags: "",
  collection: "",
  description: "",
  composition: "",
  fit: "",
  productCode: "",
  careInstructions: "",
  colors: "",
  sizes: "",
  shipping: "",
  returns: "",
  categoryId: "",
  extraImages: [] as string[],
};

const PER_PAGE = 10;

function parseExtraImages(val: string | null): string[] {
  if (!val) return [];
  try {
    const arr = JSON.parse(val);
    return Array.isArray(arr) ? arr.filter((s: unknown) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

async function uploadFiles(files: File[]): Promise<string[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.urls;
}

function ImageUpload({ label, value, onChange, onUpload }: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (files: File[]) => Promise<void>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      await onUpload(Array.from(files));
    } catch {}
    setUploading(false);
    if (ref.current) ref.current.value = "";
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {value && value.trim() !== "" && (
        <div className={styles.imagePreviews} style={{ marginBottom: 8 }}>
          <div className={`${styles.imagePreview} ${styles.imagePreviewMain}`}>
            <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button className={styles.imagePreviewRemove} onClick={() => onChange("")} type="button">×</button>
          </div>
        </div>
      )}
      <div className={styles.imageUploadArea} onClick={() => ref.current?.click()}>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className={styles.imageUploadLabel}>
          <Upload size={16} strokeWidth={1.5} />
          {uploading ? "Uploading..." : "Click to upload or drag & drop"}
          <span>JPG, PNG, WebP — max 5MB</span>
        </div>
      </div>
      <input
        className={styles.input}
        style={{ marginTop: 6 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL"
      />
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const extraImagesRef = useRef<HTMLInputElement>(null);
  const [extraUploading, setExtraUploading] = useState(false);

  const showSnackbar = useCallback((type: "success" | "error", message: string) => {
    setSnackbar({ type, message });
    setTimeout(() => setSnackbar(null), 3000);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); }),
      fetch("/api/categories").then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); }),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(() => setFetchError("Impossible de charger les produits"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.category?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.gender ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.collection ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
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
        if (deleteTarget) setDeleteTarget(null);
        else if (showModal) setShowModal(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showModal, deleteTarget]);

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
      originalPrice: product.originalPrice ?? "",
      image: product.image,
      hoverImage: product.hoverImage ?? "",
      gender: product.gender ?? "",
      isOnSale: product.isOnSale,
      stock: product.stock,
      tags: product.tags ?? "",
      collection: product.collection ?? "",
      description: product.description ?? "",
      composition: product.composition ?? "",
      fit: product.fit ?? "",
      productCode: product.productCode ?? "",
      careInstructions: product.careInstructions ?? "",
      colors: product.colors ?? "",
      sizes: product.sizes ?? "",
      shipping: product.shipping ?? "",
      returns: product.returns ?? "",
      categoryId: product.category?.id ? String(product.category.id) : "",
      extraImages: parseExtraImages(product.images),
    });
    setShowModal(true);
  }, []);

  const handleExtraUpload = useCallback(async (files: File[]) => {
    const urls = await uploadFiles(files);
    setForm((f) => {
      const merged = [...f.extraImages, ...urls].slice(0, 4);
      return { ...f, extraImages: merged };
    });
  }, []);

  const removeExtraImage = useCallback((idx: number) => {
    setForm((f) => ({
      ...f,
      extraImages: f.extraImages.filter((_, i) => i !== idx),
    }));
  }, []);

  const handleExtraFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setExtraUploading(true);
    try {
      await handleExtraUpload(Array.from(files));
    } catch {}
    setExtraUploading(false);
    if (extraImagesRef.current) extraImagesRef.current.value = "";
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const payload = {
        name: form.name,
        price: form.price,
        originalPrice: form.originalPrice || null,
        image: form.image,
        hoverImage: form.hoverImage || null,
        gender: form.gender || null,
        isOnSale: form.isOnSale,
        stock: form.stock,
        tags: form.tags || null,
        collection: form.collection || null,
        description: form.description || null,
        composition: form.composition || null,
        fit: form.fit || null,
        productCode: form.productCode || null,
        careInstructions: form.careInstructions || null,
        images: form.extraImages.length ? JSON.stringify(form.extraImages) : null,
        colors: form.colors || null,
        sizes: form.sizes || null,
        shipping: form.shipping || null,
        returns: form.returns || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };

      try {
        if (editing) {
          const res = await fetch(`/api/products/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            showSnackbar("error", "Y a un problème, impossible de mettre à jour");
            return;
          }
          const updated = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          showSnackbar("success", "Produit mis à jour avec succès");
        } else {
          const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            showSnackbar("error", "Y a un problème, impossible de créer");
            return;
          }
          const created = await res.json();
          setProducts((prev) => [...prev, created]);
          showSnackbar("success", "Produit ajouté avec succès");
        }
        setShowModal(false);
      } catch {
        showSnackbar("error", "Y a un problème, impossible de sauvegarder");
      }
    },
    [form, editing, showSnackbar]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        showSnackbar("error", "Y a un problème, impossible de supprimer");
        setDeleteTarget(null);
        return;
      }
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== deleteTarget.id);
        const newTotalPages = Math.max(1, Math.ceil(next.length / PER_PAGE));
        if (page > newTotalPages) setPage(newTotalPages);
        return next;
      });
      showSnackbar("success", "Produit supprimé avec succès");
    } catch {
      showSnackbar("error", "Y a un problème, impossible de supprimer");
    }
    setDeleteTarget(null);
  }, [deleteTarget, showSnackbar, page]);

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
        ) : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} total`}
      </div>

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
            <th>Collection</th>
            <th>Gender</th>
            <th>Stock</th>
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
              <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#888" }}>No products found</td>
            </tr>
          ) : (
            paginated.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productCell}>
                    <Image src={product.image} alt={product.name} width={44} height={57} className={styles.productThumb} />
                    <span className={styles.productName}>{product.name}</span>
                  </div>
                </td>
                <td>
                  <div>{product.price}</div>
                  {product.originalPrice && (
                    <div style={{ color: "#888", fontSize: 11, textDecoration: "line-through" }}>{product.originalPrice}</div>
                  )}
                </td>
                <td>{product.category?.name ?? "-"}</td>
                <td style={{ color: "#888", fontSize: 12 }}>{product.collection ?? "-"}</td>
                <td>{product.gender ?? "-"}</td>
                <td>
                  <span className={`${styles.badge} ${product.stock > 0 ? styles.badgeActive : styles.badgeSale}`}>{product.stock}</span>
                </td>
                <td>
                  {product.isOnSale ? (
                    <span className={`${styles.badge} ${styles.badgeSale}`}>Sale</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                  )}
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.actionBtn} onClick={() => openEdit(product)}><Edit3 size={15} strokeWidth={1.5} /></button>
                    <button className={styles.actionBtn} onClick={() => setDeleteTarget(product)}><Trash2 size={15} strokeWidth={1.5} /></button>
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

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editing ? "Edit Product" : "Add Product"}</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}><X size={18} strokeWidth={1.5} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Price</label>
                    <input className={styles.input} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Original Price</label>
                    <input className={styles.input} value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))} placeholder="Optional" />
                  </div>
                </div>

                <ImageUpload
                  label="Main Image"
                  value={form.image}
                  onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                  onUpload={async (files) => {
                    const urls = await uploadFiles(files);
                    if (urls[0]) setForm((f) => ({ ...f, image: urls[0] }));
                  }}
                />

                <ImageUpload
                  label="Hover Image"
                  value={form.hoverImage}
                  onChange={(url) => setForm((f) => ({ ...f, hoverImage: url }))}
                  onUpload={async (files) => {
                    const urls = await uploadFiles(files);
                    if (urls[0]) setForm((f) => ({ ...f, hoverImage: urls[0] }));
                  }}
                />

                <div className={styles.field}>
                  <label className={styles.label}>Additional Images (max 4)</label>
                  {form.extraImages.length > 0 && (
                    <div className={styles.imagePreviews}>
                      {form.extraImages.map((url, idx) => (
                        <div key={idx} className={styles.imagePreview}>
                          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button className={styles.imagePreviewRemove} onClick={() => removeExtraImage(idx)} type="button">×</button>
                          <div className={styles.imagePreviewBadge}>{idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.extraImages.length < 4 && (
                    <div className={styles.imageUploadArea} onClick={() => extraImagesRef.current?.click()}>
                      <input
                        ref={extraImagesRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleExtraFiles(e.target.files)}
                      />
                      <div className={styles.imageUploadLabel}>
                        <Upload size={16} strokeWidth={1.5} />
                        {extraUploading ? "Uploading..." : `Add image (${form.extraImages.length}/4)`}
                        <span>Click to upload</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Gender</label>
                    <select className={styles.input} value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                      <option value="">-</option>
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Category</label>
                    <select className={styles.input} value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                      <option value="">-</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Collection</label>
                    <input className={styles.input} value={form.collection} onChange={(e) => setForm((f) => ({ ...f, collection: e.target.value }))} placeholder="e.g. Summer 2025" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Stock</label>
                    <input className={styles.input} type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Tags</label>
                  <input className={styles.input} value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="Comma separated: women,sale,new-in" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Product Code</label>
                  <input className={styles.input} value={form.productCode} onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea className={styles.textarea} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Composition</label>
                  <input className={styles.input} value={form.composition} onChange={(e) => setForm((f) => ({ ...f, composition: e.target.value }))} placeholder="e.g. 100% Silk" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Fit</label>
                  <input className={styles.input} value={form.fit} onChange={(e) => setForm((f) => ({ ...f, fit: e.target.value }))} placeholder="e.g. Regular fit" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Sizes</label>
                  <input className={styles.input} value={form.sizes} onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))} placeholder='JSON: ["XS","S","M","L"]' />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Colors</label>
                  <input className={styles.input} value={form.colors} onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))} placeholder='JSON: [{"name":"Black","hex":"#111"}]' />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Care Instructions</label>
                  <input className={styles.input} value={form.careInstructions} onChange={(e) => setForm((f) => ({ ...f, careInstructions: e.target.value }))} placeholder='JSON array' />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Shipping</label>
                  <textarea className={styles.textarea} rows={3} value={form.shipping} onChange={(e) => setForm((f) => ({ ...f, shipping: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Returns</label>
                  <textarea className={styles.textarea} rows={3} value={form.returns} onChange={(e) => setForm((f) => ({ ...f, returns: e.target.value }))} />
                </div>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form.isOnSale} onChange={(e) => setForm((f) => ({ ...f, isOnSale: e.target.checked }))} />
                  On Sale
                </label>
              </div>
              <div className={styles.modalFooter} style={{ gap: 12 }}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className={styles.saveBtn}>{editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ width: 400 }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirmer la suppression</h3>
              <button className={styles.modalClose} onClick={() => setDeleteTarget(null)}><X size={18} strokeWidth={1.5} /></button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                Voulez-vous vraiment supprimer <strong>{deleteTarget.name}</strong> ? Cette action est irréversible.
              </p>
            </div>
            <div className={styles.modalFooter} style={{ gap: 12 }}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className={styles.saveBtn} style={{ background: "#c62828" }} onClick={confirmDelete}>Supprimer</button>
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
