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
import { parseAmount } from "../lib/pricing";

const STORAGE_KEY = "aighis_cart";
const EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface CartItem {
  id: number;
  lineId: string;
  name: string;
  price: string;
  image: string;
  size: string;
  color: string | null;
  hex: string | null;
  quantity: number;
}

export function buildLineId(id: number, size: string, color: string | null): string {
  return `${id}::${size}::${color ?? ""}`;
}

interface StoredData {
  items: CartItem[];
  timestamp: number;
}

function readStorage(): CartItem[] {
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

    return data.items.map((item) => ({
      ...item,
      color: item.color ?? null,
      hex: item.hex ?? null,
      lineId: item.lineId ?? buildLineId(item.id, item.size, item.color ?? null),
    }));
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  try {
    const data: StoredData = { items, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable */
  }
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size?: string, color?: string | null, hex?: string | null) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function formatPrice(price: string): number {
  return parseAmount(price) ?? 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStorage(items);
  }, [items, hydrated]);

  const addItem = useCallback(
    (product: Product, size = "One Size", color: string | null = null, hex: string | null = null) => {
      const lineId = buildLineId(product.id, size, color);

      setItems((prev) => {
        const existing = prev.find((item) => item.lineId === lineId);

        if (existing) {
          return prev.map((item) =>
            item.lineId === lineId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [
          ...prev,
          {
            id: product.id,
            lineId,
            name: product.name,
            price: product.price,
            image: product.image,
            size,
            color,
            hex,
            quantity: 1,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) return;

    setItems((prev) =>
      prev.map((item) => (item.lineId === lineId ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items
    .reduce((sum, item) => {
      const price = formatPrice(item.price);
      return sum + price * item.quantity;
    }, 0)
    .toFixed(2);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
