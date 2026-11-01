import { Suspense } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ProductsLayout from "../components/ProductsLayout/ProductsLayout";
import { getAllProducts } from "../lib/storefrontProducts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection de vêtements",
  description:
    "Parcourez les vêtements et nouveautés Aighis Byrca pour femme et homme.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <>
      <Navbar compact />
      <Suspense fallback={null}>
        <ProductsLayout products={products} />
      </Suspense>
      <Footer />
    </>
  );
}
