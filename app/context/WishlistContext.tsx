"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import type { Product } from "../components/NewArrivals/products";
import { toStorefrontProduct, type ProductRow } from "../lib/productMapper";

const STORAGE_KEY = "aighis_wishlist_ids";

interface WishlistContextType {
  /** Products resolved from the database, in the order they were added. */
  items: Product[];
  ids: number[];
  loading: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  isLiked: (productId: number) => boolean;
  toggleItem: (product: Product) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

function readStoredIds(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    // Legacy format stored full product objects.
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      const ids = parsed
        .map((entry) => {
          if (typeof entry === "number") return entry;
          if (entry && typeof entry === "object" && "id" in entry) {
            const id = (entry as { id: unknown }).id;
            return typeof id === "number" ? id : null;
          }
          return null;
        })
        .filter((id): id is number => typeof id === "number" && Number.isFinite(id));

      if (ids.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        return ids;
      }
    }
  } catch {
    /* storage unavailable or corrupted */
  }

  return [];
}

function writeStoredIds(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable */
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(readStoredIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStoredIds(ids);
  }, [ids, hydrated]);

  // Re-resolve the stored ids against the database so prices, names and
  // images always match the catalogue instead of a stale localStorage snapshot.
  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    async function resolve() {
      if (ids.length === 0) {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);

      try {
        const params = new URLSearchParams({ ids: ids.join(",") });
        const res = await fetch(`/api/wishlist?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load wishlist");

        const rows = (await res.json()) as ProductRow[];
        if (cancelled) return;

        const products = rows.map(toStorefrontProduct);
        setItems(products);

        // Drop ids for products that no longer exist.
        const found = new Set(products.map((product) => product.id));
        const missing = ids.filter((id) => !found.has(id));
        if (missing.length > 0) {
          setIds((prev) => prev.filter((id) => found.has(id)));
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [ids, hydrated]);

  const addItem = useCallback((product: Product) => {
    setIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]));
  }, []);

  const removeItem = useCallback((productId: number) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isLiked = useCallback(
    (productId: number) => ids.includes(productId),
    [ids]
  );

  const toggleItem = useCallback(
    (product: Product) => {
      setIds((prev) =>
        prev.includes(product.id)
          ? prev.filter((id) => id !== product.id)
          : [...prev, product.id]
      );
    },
    []
  );

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(
    () => ({ items, ids, loading, addItem, removeItem, isLiked, toggleItem, clear }),
    [items, ids, loading, addItem, removeItem, isLiked, toggleItem, clear]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
