"use client";

import ProductFilterLayout from "../../components/ProductFilterLayout/ProductFilterLayout";
import type { Product } from "../../components/NewArrivals/products";

interface Props {
  products: Product[];
  basePath: string;
}

export default function CategoryFilterWrapper({ products, basePath }: Props) {
  return <ProductFilterLayout products={products} basePath={basePath} />;
}
