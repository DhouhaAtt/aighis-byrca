"use client";

import ProductFilterLayout from "../ProductFilterLayout/ProductFilterLayout";
import { allProducts } from "../NewArrivals/products";

export default function ProductsLayout() {
  return (
    <ProductFilterLayout products={allProducts} basePath="/products" />
  );
}
