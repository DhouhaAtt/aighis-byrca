"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface ProductColor {
  name: string;
  hex: string;
  image?: string | null;
}

interface ProductSelection {
  colors: ProductColor[];
  selectedColor: ProductColor | null;
  setSelectedColor: (color: ProductColor) => void;
}

const ProductSelectionContext = createContext<ProductSelection | null>(null);

export function ProductSelectionProvider({
  colors,
  children,
}: {
  colors: ProductColor[];
  children: ReactNode;
}) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    colors[0] ?? null
  );

  const value = useMemo(
    () => ({ colors, selectedColor, setSelectedColor }),
    [colors, selectedColor]
  );

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
}

export function useProductSelection(): ProductSelection {
  const context = useContext(ProductSelectionContext);
  if (!context) {
    throw new Error(
      "useProductSelection must be used inside ProductSelectionProvider"
    );
  }
  return context;
}
