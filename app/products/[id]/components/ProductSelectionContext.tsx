"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { ColorOption } from "../../../lib/productJson";

interface ProductSelectionValue {
  selectedColor: ColorOption | null;
  setSelectedColor: Dispatch<SetStateAction<ColorOption | null>>;
}

const ProductSelectionContext = createContext<ProductSelectionValue | null>(null);

export function ProductSelectionProvider({
  colors,
  children,
}: {
  colors: ColorOption[];
  children: ReactNode;
}) {
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(
    colors[0] ?? null
  );
  const value = useMemo(
    () => ({ selectedColor, setSelectedColor }),
    [selectedColor]
  );

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
}

export function useProductSelection() {
  const value = useContext(ProductSelectionContext);
  if (!value) {
    throw new Error("ProductSelectionProvider is missing from the product page.");
  }
  return value;
}
