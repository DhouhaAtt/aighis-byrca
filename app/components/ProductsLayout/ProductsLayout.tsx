"use client";

import ProductFilterLayout from "../ProductFilterLayout/ProductFilterLayout";
import type { Product } from "../NewArrivals/products";

interface Props {
  products: Product[];
}

export default function ProductsLayout({ products }: Props) {
  return <ProductFilterLayout products={products} basePath="/products" />;
}