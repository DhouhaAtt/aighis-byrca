import { notFound } from "next/navigation";
import { connection } from "next/server";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import PageHeader from "../../components/PageHeader/PageHeader";
import Breadcrumb from "./components/Breadcrumb";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductAccordion from "./components/ProductAccordion";
import RelatedProducts from "./components/RelatedProducts";

import { productDetails } from "../../lib/productData";
import type { ProductDetail } from "../../lib/productData";
import { RETURNS_INFO, SHIPPING_INFO } from "../../lib/storePolicy";
import {
  getProductById,
  getRelatedProducts,
  parseCareInstructions,
  parseColors,
  parseImages,
  parseSizes,
} from "../../lib/storefrontProducts";

import styles from "./ProductDetail.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return productDetails.map((product) => ({
    id: String(product.id),
  }));
}

function toProductDetail(
  row: NonNullable<Awaited<ReturnType<typeof getProductById>>>
): ProductDetail {
  const images = parseImages(row.images);

  return {
    id: row.id,
    name: row.name,
    price: row.price,
    originalPrice: row.originalPrice,
    isOnSale: row.isOnSale,
    category: row.category?.name.toUpperCase() || "NEW COLLECTION",
    collection: row.collection || "",
    description: row.description || "",
    composition: row.composition || "",
    fit: row.fit || "",
    productCode: row.productCode || "",
    careInstructions: parseCareInstructions(row.careInstructions),
    images: images.length > 0 ? images : [row.image],
    thumbnailImages: images.length > 0 ? images : [row.image],
    colors: parseColors(row.colors),
    sizes: parseSizes(row.sizes),
    shipping: SHIPPING_INFO,
    returns: RETURNS_INFO,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  await connection();

  const { id } = await params;
  const productId = Number(id);
  const product =
    (await getProductById(productId).then((row) =>
      row ? toProductDetail(row) : null
    )) ??
    productDetails.find((p) => p.id === productId) ??
    null;

  if (!product) notFound();

  const related = await getRelatedProducts(productId);

  return (
    <>
      <Navbar compact />

      <PageHeader title={product.name} subtitle={product.collection} />

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