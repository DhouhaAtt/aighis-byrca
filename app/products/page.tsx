import { Suspense } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ProductsLayout from "../components/ProductsLayout/ProductsLayout";
import { getAllProducts } from "../lib/storefrontProducts";

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
