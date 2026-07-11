import { Suspense } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ProductsLayout from "../components/ProductsLayout/ProductsLayout";
import PageHeader from "../components/PageHeader/PageHeader";

export default function ProductsPage() {
  return (
    <>
      <Navbar compact />
      <PageHeader title="" subtitle="" />
      <Suspense fallback={null}>
        <ProductsLayout />
      </Suspense>
      <Footer />
    </>
  );
}
