"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

import type { Product } from "../components/NewArrivals/products";

const STORAGE_KEY = "aighis_wishlist";
const EXPIRY_MS = 24 * 60 * 60 * 1000;

interface StoredData {
  items: Product[];
  timestamp: number;
}

function readStorage(): Product[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const data: StoredData = JSON.parse(raw);
    const expired = Date.now() - data.timestamp > EXPIRY_MS;

    if (expired) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return data.items;
  } catch {
    return [];
  }
}

function writeStorage(items: Product[]) {
  try {
    const data: StoredData = { items, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  isLiked: (productId: number) => boolean;
  toggleItem: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(items);
  }, [items, hydrated]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const isLiked = useCallback(
    (productId: number) => items.some((item) => item.id === productId),
    [items]
  );

  const toggleItem = useCallback(
    (product: Product) => {
      if (isLiked(product.id)) {
        removeItem(product.id);
      } else {
        addItem(product);
      }
    },
    [isLiked, removeItem, addItem]
  );

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, isLiked, toggleItem }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
