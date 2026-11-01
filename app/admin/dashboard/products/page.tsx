"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Edit3, Trash2, X, Upload, Check } from "lucide-react";
import styles from "../AdminTable.module.css";
import { formatTndPrice } from "../../../lib/formatPrice";

interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice: string | null;
  image: string;
  hoverImage: string | null;
  gender: string | null;
  isOnSale: boolean;
  isNewArrival: boolean;
  isPremium?: boolean;
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

interface ColorOption {
  name: string;
  hex: string;
  image?: string | null;
}

interface VariantRow {
  size: string;
  color: string;
  hex: string | null;
}

const DEFAULT_SIZE = "One Size";
const DEFAULT_COLOR = "Default";

/** Cross product of selected sizes and colors, falling back to One Size/Default. */
function buildVariantRows(sizes: string[], colors: ColorOption[]): VariantRow[] {
  const sizeList = sizes.length > 0 ? sizes : [DEFAULT_SIZE];
  const colorList =
    colors.length > 0 ? colors : [{ name: DEFAULT_COLOR, hex: "" }];

  return sizeList.flatMap((size) =>
    colorList.map((color) => ({
      size,
      color: color.name,
      hex: color.hex || null,
    }))
  );
}

const emptyForm = {
  name: "",
  price: "",
  originalPrice: "",
  image: "",
  hoverImage: "",
  gender: "",
  isOnSale: false,
  isNewArrival: false,
  isPremium: false,
  stock: 0,
  tags: "",
  collection: "",
  description: "",
  composition: "",
  fit: "",
  productCode: "",
  careInstructions: "",
  colors: [] as ColorOption[],
  sizes: [] as string[],
  categoryId: "",
  extraImages: [] as string[],
};

const PER_PAGE = 10;

function getSafeProductImage(source: string | null | undefined): string {
  if (!source) return "/assets/products/product1.png";

  const value = source.trim();
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "/assets/products/product1.png";
  } catch {
    return "/assets/products/product1.png";
  }
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

const COLOR_PALETTE: ColorOption[] = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Cream", hex: "#EFE3D0" },
  { name: "Beige", hex: "#D9C7B0" },
  { name: "Brown", hex: "#6F4E37" },
  { name: "Camel", hex: "#B98B5E" },
  { name: "Grey", hex: "#808080" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Blue", hex: "#2E5EAA" },
  { name: "Sky", hex: "#A9C9E8" },
  { name: "Lilac", hex: "#B9A3D9" },
  { name: "Purple", hex: "#6B4E8C" },
  { name: "Pink", hex: "#E8A0BF" },
  { name: "Rose", hex: "#D4698A" },
  { name: "Red", hex: "#C0392B" },
  { name: "Burgundy", hex: "#6E1E2E" },
  { name: "Orange", hex: "#E07A3F" },
  { name: "Yellow", hex: "#F2C94C" },
  { name: "Mustard", hex: "#D9A441" },
  { name: "Olive", hex: "#6B7A4F" },
  { name: "Green", hex: "#3E6B4F" },
  { name: "Mint", hex: "#A8D5BA" },
];

function isLightColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 165;
}

function parseSizesValue(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {}
  return value
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
}

function parseColorsValue(value: string | null): ColorOption[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c): c is ColorOption => Boolean(c) && typeof c === "object" && "hex" in c)
      .map((c) => ({
        name: String(c.name ?? c.hex),
        hex: String(c.hex),
        image: typeof c.image === "string" && c.image.trim() ? c.image : null,
      }));
  } catch {
    return [];
  }
}

function parseCareList(value: string | null): string {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean).join("\n");
  } catch {}
  return value;
}

function toLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_OPTIONS.indexOf(a);
    const bi = SIZE_OPTIONS.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

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
          {uploading ? "Envoi en cours…" : "Cliquez pour choisir une image ou glissez-déposez le fichier"}
          <span>JPG, PNG, WebP — max 5MB</span>
        </div>
      </div>
      <input
        className={styles.input}
        style={{ marginTop: 6 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ou collez l’URL de l’image"
      />
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [genderFilters, setGenderFilters] = useState<string[]>([]);
  const [genderFilterOpen, setGenderFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [deleteTargets, setDeleteTargets] = useState<Product[] | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const extraImagesRef = useRef<HTMLInputElement>(null);
  const [extraUploading, setExtraUploading] = useState(false);
  const [uploadingColorHex, setUploadingColorHex] = useState<string | null>(null);

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
          (genderFilters.length === 0 || genderFilters.includes((p.gender ?? "").toLowerCase())) &&
          (p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.category?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (p.gender ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (p.collection ?? "").toLowerCase().includes(search.toLowerCase()))
      ),
    [products, search, genderFilters]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  );
  const selectedProducts = useMemo(
    () => selectedProductIds.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)),
    [products, selectedProductIds]
  );

  useEffect(() => { setPage(1); }, [search, genderFilters]);

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

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      price: product.price.replace(/\s*(?:TND|Tnd|DT)\s*$/i, "").replace(/\D/g, ""),
      originalPrice: (product.originalPrice ?? "").replace(/\s*(?:TND|Tnd|DT)\s*$/i, "").replace(/\D/g, ""),
      image: product.image,
      hoverImage: product.hoverImage ?? "",
      gender: product.gender ?? "",
      isOnSale: product.isOnSale,
      isNewArrival: product.isNewArrival,
      isPremium: Boolean(product.isPremium),
      stock: product.stock,
      tags: product.tags ?? "",
      collection: product.collection ?? "",
      description: product.description ?? "",
      composition: product.composition ?? "",
      fit: product.fit ?? "",
      productCode: product.productCode ?? "",
      careInstructions: parseCareList(product.careInstructions),
      colors: parseColorsValue(product.colors),
      sizes: sortSizes(parseSizesValue(product.sizes)),
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

  const toggleSize = useCallback((size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : sortSizes([...f.sizes, size]),
    }));
  }, []);

  const toggleColor = useCallback((color: ColorOption) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.some((c) => c.hex.toLowerCase() === color.hex.toLowerCase())
        ? f.colors.filter((c) => c.hex.toLowerCase() !== color.hex.toLowerCase())
        : [...f.colors, color],
    }));
  }, []);

  const uploadColorImage = useCallback(async (hex: string, file: File) => {
    setUploadingColorHex(hex);
    try {
      const [url] = await uploadFiles([file]);
      if (!url) throw new Error("Upload failed");
      setForm((current) => ({
        ...current,
        colors: current.colors.map((color) =>
          color.hex.toLowerCase() === hex.toLowerCase()
            ? { ...color, image: url }
            : color
        ),
      }));
    } catch {
      showSnackbar("error", "Impossible d’ajouter la photo de cette couleur");
    } finally {
      setUploadingColorHex(null);
    }
  }, [showSnackbar]);

  const removeColorImage = useCallback((hex: string) => {
    setForm((current) => ({
      ...current,
      colors: current.colors.map((color) =>
        color.hex.toLowerCase() === hex.toLowerCase()
          ? { ...color, image: null }
          : color
      ),
    }));
  }, []);

  const allSizes = useMemo(() => {
    const custom = form.sizes.filter((s) => !SIZE_OPTIONS.includes(s));
    return [...SIZE_OPTIONS, ...custom];
  }, [form.sizes]);

  const variantRows = useMemo(
    () => buildVariantRows(form.sizes, form.colors),
    [form.sizes, form.colors]
  );

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
        isNewArrival: form.isNewArrival,
        isPremium: form.isPremium,
        stock: form.stock,
        tags: form.tags || null,
        collection: form.collection || null,
        description: form.description || null,
        composition: form.composition || null,
        fit: form.fit || null,
        productCode: form.productCode || null,
        careInstructions: toLines(form.careInstructions).length
          ? JSON.stringify(toLines(form.careInstructions))
          : null,
        images: form.extraImages.length ? JSON.stringify(form.extraImages) : null,
        colors: form.colors.length ? JSON.stringify(form.colors) : null,
        sizes: form.sizes.length ? JSON.stringify(form.sizes) : null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        variants: variantRows.map((row) => ({
          size: row.size,
          color: row.color,
          hex: row.hex,
          stock: 0,
        })),
      };

      try {
        if (editing) {
          const res = await fetch(`/api/products/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const result = await res.json().catch(() => null);
            showSnackbar("error", result?.error ?? "Impossible de mettre à jour");
            return;
          }
          const updated = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setForm((f) => ({ ...f, stock: updated.stock ?? 0 }));
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
    [form, editing, showSnackbar, variantRows]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTargets?.length) return;
    try {
      const res = await fetch("/api/products/bulk-delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: deleteTargets.map((product) => product.id) }) });
      const result = await res.json();
      if (!res.ok) {
        showSnackbar("error", "Y a un problème, impossible de supprimer");
        throw new Error(result.error || "La suppression a échoué");
      }
      setProducts((prev) => {
        const deletedIds = new Set(deleteTargets.map((product) => product.id));
        const next = prev.filter((p) => !deletedIds.has(p.id));
        const newTotalPages = Math.max(1, Math.ceil(next.length / PER_PAGE));
        if (page > newTotalPages) setPage(newTotalPages);
        return next;
      });
      const deletedIds = new Set(deleteTargets.map((product) => product.id));
      setSelectedProductIds((current) => current.filter((id) => !deletedIds.has(id)));
      showSnackbar("success", `${result.deletedCount} produit(s) supprimé(s) avec succès`);
    } catch (error) {
      showSnackbar("error", error instanceof Error ? error.message : "La suppression a échoué");
    }
    setDeleteTargets(null);
  }, [deleteTargets, showSnackbar, page]);

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
        {loading ? "Chargement…" : fetchError ? (
          <div style={{ padding: 40, textAlign: "center", color: "#c62828", fontSize: 13 }}>{fetchError}</div>
        ) : `${filtered.length} produit${filtered.length !== 1 ? "s" : ""} au total`}
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Rechercher un produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.toolbarActions}>
          <div className={styles.genderFilter}>
            <button
              type="button"
              className={styles.genderFilterButton}
              aria-label="Filtrer par genre"
              aria-expanded={genderFilterOpen}
              onClick={() => setGenderFilterOpen((open) => !open)}
            >
              {genderFilters.length === 0
                ? "Tous les genres"
                : genderFilters.map((gender) => gender === "women" ? "Femmes" : gender === "men" ? "Hommes" : "Mixte").join(", ")}
            </button>
            {genderFilterOpen && (
              <div className={styles.genderFilterMenu} role="group" aria-label="Choisir les genres">
                <label className={styles.genderFilterOption}>
                  <input type="checkbox" checked={genderFilters.length === 0} onChange={() => setGenderFilters([])} />
                  Tous les genres
                </label>
                {[
                  ["women", "Femmes"],
                  ["men", "Hommes"],
                  ["unisex", "Mixte"],
                ].map(([value, label]) => (
                  <label className={styles.genderFilterOption} key={value}>
                    <input
                      type="checkbox"
                      checked={genderFilters.includes(value)}
                      onChange={() => setGenderFilters((current) =>
                        current.includes(value) ? current.filter((gender) => gender !== value) : [...current, value]
                      )}
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button className={styles.addBtn} onClick={openAdd}>
            Ajouter un produit
          </button>
        </div>
      </div>
      {selectedProducts.length >= 1 && (
        <div className={styles.selectionToolbar}>
          <span>{selectedProducts.length} produits sélectionnés</span>
          <button className={styles.bulkDeleteButton} onClick={() => setDeleteTargets(selectedProducts)}>Supprimer la sélection</button>
          <button className={styles.selectionClear} onClick={() => setSelectedProductIds([])}>Effacer la sélection</button>
        </div>
      )}

      <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th aria-label="Sélectionner" />
            <th>Produit</th>
            <th>Prix</th>
            <th>Catégorie</th>
            <th>Collection</th>
            <th>Genre</th>
            <th>Stock</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#888" }}>Chargement…</td>
            </tr>
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#888" }}>Aucun produit trouvé</td>
            </tr>
          ) : (
            paginated.map((product) => (
              <tr key={product.id}>
                <td><input aria-label={`Sélectionner ${product.name}`} type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={(event) => setSelectedProductIds((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))} /></td>
                <td>
                  <div className={styles.productCell}>
                    <Image src={getSafeProductImage(product.image)} alt={product.name} width={44} height={57} className={styles.productThumb} />
                    <span className={styles.productName}>{product.name}</span>
                  </div>
                </td>
                <td>
                  <div>{formatTndPrice(product.price)}</div>
                  {product.originalPrice && (
                    <div style={{ color: "#888", fontSize: 11, textDecoration: "line-through" }}>{formatTndPrice(product.originalPrice)}</div>
                  )}
                </td>
                <td>{product.category?.name ?? "-"}</td>
                <td style={{ color: "#888", fontSize: 12 }}>{product.collection ?? "-"}</td>
                <td>{product.gender ?? "-"}</td>
                <td>
                  <span className={`${styles.badge} ${product.stock > 0 ? styles.badgeActive : styles.badgeSale}`}>{product.stock}</span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {product.isOnSale ? (
                      <span className={`${styles.badge} ${styles.badgeSale}`}>En promotion</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeActive}`}>Actif</span>
                    )}
                    {product.isNewArrival && (
                      <span className={`${styles.badge} ${styles.badgeActive}`}>Nouveauté</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.actionBtn} onClick={() => openEdit(product)}><Edit3 size={15} strokeWidth={1.5} /></button>
                    <button className={styles.actionBtn} onClick={() => setDeleteTargets([product])}><Trash2 size={15} strokeWidth={1.5} /></button>
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
              <h3 className={styles.modalTitle}>{editing ? "Modifier le produit" : "Ajouter un produit"}</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}><X size={18} strokeWidth={1.5} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.field}>
                  <label className={styles.label}>Nom</label>
                  <input className={styles.input} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Prix (TND)</label>
                    <input className={styles.input} type="text" inputMode="numeric" pattern="[0-9]+" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/\D/g, "") }))} required />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Prix initial (TND)</label>
                    <input className={styles.input} type="text" inputMode="numeric" pattern="[0-9]*" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value.replace(/\D/g, "") }))} placeholder="Optional" />
                  </div>
                </div>

                <ImageUpload
                  label="Image principale"
                  value={form.image}
                  onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                  onUpload={async (files) => {
                    const urls = await uploadFiles(files);
                    if (urls[0]) setForm((f) => ({ ...f, image: urls[0] }));
                  }}
                />

                <ImageUpload
                  label="Image au survol"
                  value={form.hoverImage}
                  onChange={(url) => setForm((f) => ({ ...f, hoverImage: url }))}
                  onUpload={async (files) => {
                    const urls = await uploadFiles(files);
                    if (urls[0]) setForm((f) => ({ ...f, hoverImage: urls[0] }));
                  }}
                />

                <div className={styles.field}>
                  <label className={styles.label}>Images supplémentaires (4 maximum)</label>
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
                        {extraUploading ? "Envoi en cours…" : `Ajouter une image (${form.extraImages.length}/4)`}
                        <span>Cliquez pour choisir un fichier</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Genre</label>
                    <select className={styles.input} value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                      <option value="">-</option>
                      <option value="women">Femme</option>
                      <option value="men">Homme</option>
                      <option value="unisex">Mixte / Unisexe</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Catégorie</label>
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
                    <label className={styles.label}>Stock total du produit</label>
                    <input
                      className={styles.input}
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: Math.max(0, Math.trunc(Number(e.target.value) || 0)) }))}
                    />
                    <span className={styles.hint}>
                      Stock total pour le produit, indépendamment de la taille et de la couleur.
                    </span>
                  </div>
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Mots-clés</label>
                  <input className={styles.input} value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="Comma separated: women,sale,new-in" />
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>Référence produit</label>
                  <input className={styles.input} value={form.productCode} onChange={(e) => setForm((f) => ({ ...f, productCode: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea className={styles.textarea} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Composition</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={form.composition}
                    onChange={(e) => setForm((f) => ({ ...f, composition: e.target.value }))}
                    placeholder="e.g. 100% Silk. Lining: 100% Viscose. Made in Italy."
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Coupe</label>
                  <input className={styles.input} value={form.fit} onChange={(e) => setForm((f) => ({ ...f, fit: e.target.value }))} placeholder="e.g. Regular fit" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Tailles</label>
                  <div className={styles.chipGroup}>
                    {allSizes.map((size) => {
                      const active = form.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                          onClick={() => toggleSize(size)}
                          aria-pressed={active}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {form.sizes.length > 0 ? (
                    <span className={styles.hint}>{form.sizes.length} size{form.sizes.length > 1 ? "s" : ""} selected: {form.sizes.join(", ")}</span>
                  ) : (
                    <span className={styles.hint}>Aucune taille sélectionnée.</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Couleurs</label>
                  <div className={styles.swatchGrid}>
                    {COLOR_PALETTE.map((color) => {
                      const active = form.colors.some(
                        (c) => c.hex.toLowerCase() === color.hex.toLowerCase()
                      );
                      const checkColor = isLightColor(color.hex) ? "#111" : "#fff";
                      return (
                        <button
                          key={color.hex}
                          type="button"
                          className={`${styles.swatch} ${active ? styles.swatchActive : ""}`}
                          onClick={() => toggleColor(color)}
                          aria-pressed={active}
                          title={color.name}
                        >
                          <span className={styles.swatchDot} style={{ background: color.hex }}>
                            {active && (
                              <Check size={14} strokeWidth={3} style={{ color: checkColor }} />
                            )}
                          </span>
                          <span className={styles.swatchLabel}>{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {form.colors.length > 0 && (
                    <div className={styles.selectedRow}>
                      {form.colors.map((color) => (
                        <span key={color.hex} className={styles.selectedTag}>
                          <span
                            className={styles.swatchDot}
                            style={{ background: color.hex, width: 14, height: 14 }}
                          />
                          {color.name}
                          <button
                            type="button"
                            className={styles.selectedTagRemove}
                            onClick={() => toggleColor(color)}
                            aria-label={`Remove ${color.name}`}
                          >
                            <X size={11} strokeWidth={2} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {form.colors.length > 0 && (
                    <div className={styles.colorImageList}>
                      <div>
                        <p className={styles.colorImageTitle}>Photos par couleur</p>
                        <p className={styles.hint}>
                          Facultatif : ajoutez une photo pour l’afficher quand cette couleur est choisie.
                        </p>
                      </div>
                      {form.colors.map((color) => {
                        const inputId = `color-image-${color.hex.replace("#", "")}`;
                        const uploading = uploadingColorHex === color.hex;
                        return (
                          <div className={styles.colorImageRow} key={color.hex}>
                            {color.image ? (
                              <img className={styles.colorImagePreview} src={color.image} alt={`Photo ${color.name}`} />
                            ) : (
                              <span className={styles.colorImagePlaceholder} style={{ background: color.hex }} />
                            )}
                            <div className={styles.colorImageDetails}>
                              <span className={styles.colorImageName}>{color.name}</span>
                              <span className={styles.hint}>{color.image ? "Photo ajoutée" : "Photo à ajouter"}</span>
                            </div>
                            <label className={styles.colorImageAction} htmlFor={inputId}>
                              {uploading ? "Envoi…" : color.image ? "Remplacer" : "Ajouter une photo"}
                              <input
                                id={inputId}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                disabled={uploadingColorHex !== null}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file) void uploadColorImage(color.hex, file);
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                            {color.image && (
                              <button
                                type="button"
                                className={styles.colorImageRemove}
                                onClick={() => removeColorImage(color.hex)}
                                aria-label={`Supprimer la photo ${color.name}`}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {form.colors.length === 0 && (
                    <span className={styles.hint}>Aucune couleur sélectionnée.</span>
                  )}
                </div>

                {/* Care instructions: hidden from the form on purpose. The field stays in
                    form state so existing values are round-tripped untouched; uncomment to
                    edit them again. */}
                {/* <div className={styles.field}>
                  <label className={styles.label}>Conseils d’entretien</label>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={form.careInstructions}
                    onChange={(e) => setForm((f) => ({ ...f, careInstructions: e.target.value }))}
                    placeholder="One instruction per line"
                  />
                </div> */}
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form.isOnSale} onChange={(e) => setForm((f) => ({ ...f, isOnSale: e.target.checked }))} />
                  En promotion
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm((f) => ({ ...f, isNewArrival: e.target.checked }))} />
                  Afficher dans les nouveautés (accueil)
                </label>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))} />
                  Collection Premium
                </label>
              </div>
              <div className={styles.modalFooter} style={{ gap: 12 }}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className={styles.saveBtn}>{editing ? "Enregistrer" : "Créer"}</button>
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
              <button className={styles.modalClose} onClick={() => setDeleteTargets(null)}><X size={18} strokeWidth={1.5} /></button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                Voulez-vous vraiment supprimer {deleteTargets.length === 1 ? <><strong>{deleteTargets[0].name}</strong> ?</> : <><strong>{deleteTargets.length} produits</strong> ?</>} Cette action est irréversible. Les historiques de commande seront conservés.
              </p>
              {deleteTargets.length > 1 && <ul className={styles.deleteList}>{deleteTargets.map((product) => <li key={product.id}>{product.name}</li>)}</ul>}
            </div>
            <div className={styles.modalFooter} style={{ gap: 12 }}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTargets(null)}>Annuler</button>
              <button className={styles.saveBtn} style={{ background: "#c62828" }} onClick={confirmDelete}>Supprimer {deleteTargets.length > 1 ? `(${deleteTargets.length})` : ""}</button>
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
