import { notFound } from "next/navigation";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import PageHeader from "../../components/PageHeader/PageHeader";
import Breadcrumb from "./components/Breadcrumb";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductAccordion from "./components/ProductAccordion";
import RelatedProducts from "./components/RelatedProducts";

import { productDetails } from "../../lib/productData";
import { womenProducts } from "../../components/NewArrivals/products";

import styles from "./ProductDetail.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return productDetails.map((product) => ({
    id: String(product.id),
  }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = productDetails.find((p) => p.id === Number(id));

  if (!product) notFound();

  const related = womenProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <Navbar compact />

      <PageHeader
        title={product.name}
        subtitle={product.collection}
      />

      <main className={styles.page}>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.category, href: "#" },
            { label: product.name },
          ]}
        />

        <div className={styles.layout}>
          <ProductGallery images={product.images} name={product.name} />

          <ProductInfo product={product} />
        </div>

        <ProductAccordion product={product} />

        <RelatedProducts products={related} title="Complete the Look" />
      </main>

      <Footer />
    </>
  );
}
